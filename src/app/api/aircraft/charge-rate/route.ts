import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { aircraft_id, flight_type_id, rate_per_hour, charge_hobbs, charge_tacho } = body;

  if (!aircraft_id || !flight_type_id) {
    return NextResponse.json({ error: 'Missing aircraft_id or flight_type_id' }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch organization_id from aircraft
  const { data: aircraft, error: aircraftError } = await supabase
    .from('aircraft')
    .select('organization_id')
    .eq('id', aircraft_id)
    .maybeSingle();
  if (aircraftError || !aircraft) {
    return NextResponse.json({ error: 'Aircraft not found or missing organization_id' }, { status: 400 });
  }
  const organization_id = aircraft.organization_id;

  // Check for duplicate
  const { data: existing, error: findError } = await supabase
    .from('aircraft_charge_rates')
    .select('id')
    .eq('aircraft_id', aircraft_id)
    .eq('flight_type_id', flight_type_id)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ error: 'Charge rate for this flight type already exists.' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('aircraft_charge_rates')
    .insert({
      aircraft_id,
      flight_type_id,
      rate_per_hour,
      charge_hobbs,
      charge_tacho,
      organization_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, chargeRate: data });
} 