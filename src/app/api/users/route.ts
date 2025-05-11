import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({ error: 'Missing ids param' }, { status: 400 });
  }
  const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_image_url')
      .in('id', ids);
    if (error) {
      console.error('[API users] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('[API users] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
} 