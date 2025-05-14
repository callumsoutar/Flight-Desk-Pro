import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

// @ts-expect-error Next.js App Router context must be untyped
export async function PATCH(req: NextRequest, context) {
  const id = context.params.id;
  const body = await req.json();
  const { charge_hobbs, charge_tacho, rate_per_hour, flight_type_id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();

  // Optionally: check user session/role here for security

  const { error } = await supabase
    .from('aircraft_charge_rates')
    .update({
      charge_hobbs,
      charge_tacho,
      rate_per_hour,
      flight_type_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 