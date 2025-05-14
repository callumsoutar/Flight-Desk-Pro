import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabaseServerClient';
import type { AircraftChargeRate, AircraftEquipment, AircraftTechLog, FlightType } from '@/types/aircraft';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import EditChargeRateTable from '@/components/aircraft/EditChargeRateTable';
import type { Defect } from '@/types/defects';
import AddDefectButtonModal from '@/components/aircraft/AddDefectButtonModal';
import DefectTable from '@/components/aircraft/DefectTable';
import MaintenanceTabContent from '@/components/aircraft/MaintenanceTabContent';

function getInitials(registration: string) {
  return registration?.replace(/[^A-Z0-9]/gi, '').slice(-2).toUpperCase() || 'AC';
}

export default async function AircraftViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch aircraft by id
  const { data: aircraft, error: aircraftError } = await supabase
    .from('aircraft')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (aircraftError || !aircraft) {
    notFound();
  }

  // Fetch related data
  const [chargeRatesRes, equipmentRes, techLogRes, flightTypesRes, defectsRes] = await Promise.all([
    supabase.from('aircraft_charge_rates').select('*').eq('aircraft_id', id),
    supabase.from('aircraft_equipment').select('*').eq('aircraft_id', id),
    supabase.from('aircraft_tech_log').select('*').eq('aircraft_id', id),
    supabase.from('flight_types').select('*').eq('organization_id', aircraft.organization_id),
    supabase.from('defects').select('*').eq('aircraft_id', id),
  ]);
  if (chargeRatesRes.error || equipmentRes.error || techLogRes.error || flightTypesRes.error || defectsRes.error) {
    notFound();
  }
  const chargeRates: AircraftChargeRate[] = chargeRatesRes.data || [];
  const equipment: AircraftEquipment[] = equipmentRes.data || [];
  const techLog: AircraftTechLog[] = techLogRes.data || [];
  const flightTypes: FlightType[] = flightTypesRes.data || [];
  const defects: Defect[] = defectsRes.data || [];

  // Map flight types by id for quick lookup
  const flightTypeMap = Object.fromEntries(flightTypes.map(ft => [ft.id, ft]));

  // Status badge color
  const statusColor = aircraft.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600';

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      <Link href="/aircraft" className="text-blue-600 hover:underline text-sm mb-6 inline-block">&larr; Back to Aircraft List</Link>
      <Card className="flex flex-col gap-0 p-6 mb-6 bg-white rounded-xl shadow border border-slate-100">
        {/* Header row: avatar, registration, status */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              {aircraft.image_url ? (
                <Image src={aircraft.image_url} alt="Aircraft" width={64} height={64} className="object-cover w-full h-full" />
              ) : (
                <span className="text-xl font-bold text-slate-400">{getInitials(aircraft.registration)}</span>
              )}
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-tight">{aircraft.registration}</div>
              <div className="text-sm text-slate-500 font-medium mt-0.5">
                {aircraft.type} &bull; {aircraft.model} &bull; {aircraft.year_manufactured || '--'}
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor} border border-slate-200`} style={{fontSize: '0.75rem'}}>{aircraft.status}</span>
        </div>
        {/* Details row: key info in a compact grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-2 mb-1">
          <div>
            <div className="text-xs text-slate-500 font-medium">Manufacturer</div>
            <div className="text-base font-bold text-slate-900">{aircraft.manufacturer || '--'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Capacity</div>
            <div className="text-base font-bold text-slate-900">{aircraft.capacity || '--'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Hours</div>
            <div className="text-base font-bold text-slate-900">{aircraft.total_hours}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Current Tach</div>
            <div className="text-base font-bold text-slate-900">{aircraft.current_tach}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Current Hobbs</div>
            <div className="text-base font-bold text-slate-900">{aircraft.current_hobbs}</div>
          </div>
        </div>
      </Card>
      {/* Tabs section below card, visually separated */}
      <div className="bg-slate-50 rounded-xl shadow border border-slate-100 p-2">
        <Tabs defaultValue="techlog" className="w-full">
          <TabsList className="mb-4 bg-slate-100 rounded-lg shadow-none p-1 flex gap-2 border border-slate-200">
            <TabsTrigger value="history">Flight History</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="techlog">Tech Log</TabsTrigger>
            <TabsTrigger value="defects">Defects</TabsTrigger>
            <TabsTrigger value="charges">Charge Rates</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <Card className="p-8 text-slate-600 shadow-none bg-white border border-slate-100">Flight history coming soon.</Card>
          </TabsContent>
          <TabsContent value="maintenance">
            <Card className="p-0 overflow-x-auto shadow-none bg-white border border-slate-100">
              <MaintenanceTabContent equipment={equipment} aircraftTotalHours={aircraft.total_hours} />
            </Card>
          </TabsContent>
          <TabsContent value="techlog">
            <Card className="p-0 overflow-x-auto shadow-none bg-white border border-slate-100">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entry Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tach</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hobbs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {techLog.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No tech log entries.</td></tr>
                  )}
                  {techLog.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{new Date(entry.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{entry.entry_type}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{entry.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{entry.tach ?? '--'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{entry.hobbs ?? '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
          <TabsContent value="defects">
            <Card className="p-0 overflow-x-auto shadow-none bg-white border border-slate-100">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200 bg-white rounded-t-xl">
                <span className="text-lg font-bold text-slate-800">Aircraft Defects</span>
                <AddDefectButtonModal aircraftId={aircraft.id} organizationId={aircraft.organization_id} buttonProps={{ variant: 'default' }} />
              </div>
              <DefectTable defects={defects} />
            </Card>
          </TabsContent>
          <TabsContent value="charges">
            <Card className="p-0 overflow-x-auto shadow-none bg-white border border-slate-100">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200 bg-white rounded-t-xl">
                <span className="text-lg font-bold text-slate-800">Charge Rates</span>
                {/* Add/Edit button for charge rates if needed */}
              </div>
              <EditChargeRateTable chargeRates={chargeRates} flightTypeMap={flightTypeMap} flightTypes={flightTypes} aircraftId={aircraft.id} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 