import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get('bookingId');
  if (!bookingId) {
    console.error('[API] Missing bookingId');
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }
  try {
    const { data, error } = await supabase
      .from('instructor_comments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('[API] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  try {
    const body = await req.json();
    const { booking_id, comment, instructor_id, organization_id } = body;
    // Debug: log incoming payload
    console.log('[DEBUG] Incoming payload:', { booking_id, comment, instructor_id, organization_id });
    if (!booking_id || !comment) {
      return NextResponse.json({ error: 'Missing booking_id or comment' }, { status: 400 });
    }
    if (!instructor_id) {
      return NextResponse.json({ error: 'Missing instructor_id' }, { status: 400 });
    }
    // Fetch the booking to get organization_id if not provided
    let orgId = organization_id;
    if (!orgId) {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('organization_id')
        .eq('id', booking_id)
        .maybeSingle();
      if (bookingError) {
        console.error('[DEBUG] Error fetching booking:', bookingError);
        return NextResponse.json({ error: 'Error fetching booking' }, { status: 500 });
      }
      if (!booking) {
        console.error('[DEBUG] Booking not found for id:', booking_id);
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      orgId = booking.organization_id;
    }
    // Debug: log resolved orgId
    console.log('[DEBUG] Resolved organization_id:', orgId);
    // Check user_organizations for this user/org
    const { data: userOrgRows, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('user_id', instructor_id)
      .eq('organization_id', orgId)
      .in('role', ['instructor', 'owner']);
    if (userOrgError) {
      console.error('[DEBUG] Error querying user_organizations:', userOrgError);
    } else {
      console.log('[DEBUG] user_organizations rows:', userOrgRows);
    }
    // Insert with all required fields
    const { data, error } = await supabase
      .from('instructor_comments')
      .insert([{ booking_id, instructor_id, organization_id: orgId, comment }])
      .select()
      .single();
    if (error) {
      console.error('[API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
} 