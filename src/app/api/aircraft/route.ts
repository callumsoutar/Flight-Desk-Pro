import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';
import type { AircraftWithDetails, AircraftChargeRate, AircraftEquipment, AircraftTechLog, FlightType } from '@/types/aircraft';

export async function GET() {
  const supabase = await createClient();
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Get user's organization
  const { data: userOrgRows, error: userOrgError } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1);
  if (userOrgError || !userOrgRows || userOrgRows.length === 0) {
    return NextResponse.json({ error: 'No organization found for user' }, { status: 403 });
  }
  const orgId = userOrgRows[0].organization_id;

  // Fetch aircraft for this org
  const { data: aircraftRows, error: aircraftError } = await supabase
    .from('aircraft')
    .select('*')
    .eq('organization_id', orgId);
  if (aircraftError) {
    return NextResponse.json({ error: 'Failed to fetch aircraft' }, { status: 500 });
  }
  const aircraftIds = (aircraftRows || []).map(a => a.id);

  // Fetch related data
  const [chargeRatesRes, equipmentRes, techLogRes, flightTypesRes] = await Promise.all([
    supabase.from('aircraft_charge_rates').select('*').in('aircraft_id', aircraftIds),
    supabase.from('aircraft_equipment').select('*').in('aircraft_id', aircraftIds),
    supabase.from('aircraft_tech_log').select('*').in('aircraft_id', aircraftIds),
    supabase.from('flight_types').select('*').eq('organization_id', orgId),
  ]);
  if (chargeRatesRes.error || equipmentRes.error || techLogRes.error || flightTypesRes.error) {
    return NextResponse.json({ error: 'Failed to fetch related data' }, { status: 500 });
  }
  const chargeRates: AircraftChargeRate[] = chargeRatesRes.data || [];
  const equipment: AircraftEquipment[] = equipmentRes.data || [];
  const techLog: AircraftTechLog[] = techLogRes.data || [];
  const flightTypes: FlightType[] = flightTypesRes.data || [];

  // Map flight types by id for quick lookup
  const flightTypeMap = Object.fromEntries(flightTypes.map(ft => [ft.id, ft]));

  // Build AircraftWithDetails array
  const result: AircraftWithDetails[] = (aircraftRows || []).map(ac => {
    const acChargeRates = chargeRates.filter(cr => cr.aircraft_id === ac.id);
    const acFlightTypes = acChargeRates.map(cr => flightTypeMap[cr.flight_type_id]).filter(Boolean);
    return {
      ...ac,
      charge_rates: acChargeRates,
      equipment: equipment.filter(eq => eq.aircraft_id === ac.id),
      tech_log: techLog.filter(tl => tl.aircraft_id === ac.id),
      flight_types: acFlightTypes,
    };
  });

  return NextResponse.json(result);
} 