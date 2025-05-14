'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
// TODO: Replace with shadcn/ui Checkbox when available
const Checkbox = ({ id, checked, onCheckedChange }: { id: string, checked: boolean, onCheckedChange: (v: boolean) => void }) => (
  <input id={id} type="checkbox" checked={checked} onChange={e => onCheckedChange(e.target.checked)} className="w-4 h-4" />
);

// Define minimal types for ChargeRate and FlightType
type ChargeRate = {
  id: string;
  flight_type_id: string;
  rate_per_hour: number;
  charge_hobbs: boolean;
  charge_tacho: boolean;
};
type FlightType = {
  id: string;
  name: string;
};

type EditChargeRateTableProps = { chargeRates: ChargeRate[]; flightTypeMap: Record<string, FlightType>; flightTypes: FlightType[]; aircraftId: string };
export default function EditChargeRateTable({ chargeRates: initialChargeRates, flightTypeMap, flightTypes, aircraftId }: EditChargeRateTableProps) {
  const [chargeRates, setChargeRates] = useState<ChargeRate[]>(initialChargeRates);
  const [editing, setEditing] = useState<ChargeRate | null>(null);
  const [addMode, setAddMode] = useState(false);

  // Handler to update a row after save
  const handleUpdate = (updated: ChargeRate) => {
    setChargeRates(rates => rates.map(r => r.id === updated.id ? { ...r, ...updated } : r));
  };
  // Handler to add a new row after add
  const handleAdd = (added: ChargeRate) => {
    setChargeRates(rates => [...rates, added]);
  };

  // Flight types not already used
  const usedFlightTypeIds = new Set(chargeRates.map(r => r.flight_type_id));
  const availableFlightTypes = flightTypes.filter(ft => !usedFlightTypeIds.has(ft.id));
  const canAdd = availableFlightTypes.length > 0;

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-base font-semibold text-slate-700">Charge Rates</span>
        <Button
          onClick={() => setAddMode(true)}
          disabled={!canAdd}
          variant="default"
          className="px-5 py-2 rounded-lg shadow-sm font-semibold"
        >
          Add Charge Rate
        </Button>
      </div>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Flight Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rate/Hour</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Edit</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {chargeRates.length === 0 && (
            <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No charge rates.</td></tr>
          )}
          {chargeRates.map((rate) => (
            <tr key={rate.id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{flightTypeMap[rate.flight_type_id]?.name || '--'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{rate.rate_per_hour}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <Button size="sm" variant="outline" onClick={() => setEditing(rate)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditChargeRateModal
        open={!!editing}
        rate={editing}
        onClose={() => setEditing(null)}
        flightTypes={flightTypes}
        onSave={handleUpdate}
        mode="edit"
        aircraftId={aircraftId}
      />
      <EditChargeRateModal
        open={addMode}
        rate={null}
        onClose={() => setAddMode(false)}
        flightTypes={availableFlightTypes}
        onSave={handleAdd}
        mode="add"
        aircraftId={aircraftId}
      />
    </>
  );
}

type EditChargeRateModalProps = {
  open: boolean;
  rate: ChargeRate | null;
  onClose: () => void;
  flightTypes: FlightType[];
  onSave: (updated: ChargeRate) => void;
  mode: 'edit' | 'add';
  aircraftId?: string;
};
function EditChargeRateModal({ open, rate, onClose, flightTypes, onSave, mode, aircraftId }: EditChargeRateModalProps) {
  const [chargeHobbs, setChargeHobbs] = useState(false);
  const [chargeTacho, setChargeTacho] = useState(false);
  const [ratePerHour, setRatePerHour] = useState<number>(0);
  const [flightTypeId, setFlightTypeId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && mode === 'edit' && rate) {
      setChargeHobbs(!!rate.charge_hobbs);
      setChargeTacho(!!rate.charge_tacho);
      setRatePerHour(rate.rate_per_hour ?? 0);
      setFlightTypeId(rate.flight_type_id ?? '');
      setError(null);
    } else if (open && mode === 'add') {
      setChargeHobbs(false);
      setChargeTacho(false);
      setRatePerHour(0);
      setFlightTypeId(flightTypes[0]?.id || '');
      setError(null);
    }
  }, [open, rate, mode, flightTypes]);

  if (!open) return null;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && rate) {
        const res = await fetch(`/api/aircraft/charge-rate/${rate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            charge_hobbs: chargeHobbs,
            charge_tacho: chargeTacho,
            rate_per_hour: ratePerHour,
            flight_type_id: flightTypeId,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update charge rate');
        }
        onSave({
          ...rate,
          charge_hobbs: chargeHobbs,
          charge_tacho: chargeTacho,
          rate_per_hour: ratePerHour,
          flight_type_id: flightTypeId,
        });
        onClose();
      } else if (mode === 'add') {
        if (!aircraftId) {
          setError('Missing aircraft_id');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/aircraft/charge-rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aircraft_id: aircraftId,
            charge_hobbs: chargeHobbs,
            charge_tacho: chargeTacho,
            rate_per_hour: ratePerHour,
            flight_type_id: flightTypeId,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to add charge rate');
        }
        const data = await res.json();
        onSave(data.chargeRate);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl shadow-2xl p-8 bg-white border border-slate-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Edit Charge Rate</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label htmlFor="flight_type" className="block text-sm font-semibold mb-2 text-slate-700">Flight Type</label>
            <Select value={flightTypeId} onValueChange={setFlightTypeId}>
              <SelectTrigger className="w-full border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm">
                <SelectValue placeholder="Select flight type" />
              </SelectTrigger>
              <SelectContent>
                {flightTypes.map(ft => (
                  <SelectItem key={ft.id} value={ft.id}>{ft.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="rate_per_hour" className="block text-sm font-semibold mb-2 text-slate-700">Hourly Rate</label>
            <Input
              id="rate_per_hour"
              type="number"
              className="w-full border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
              value={ratePerHour}
              onChange={e => setRatePerHour(Number(e.target.value) || 0)}
              min={0}
              placeholder="Enter hourly rate"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="charge_hobbs" checked={chargeHobbs} onCheckedChange={setChargeHobbs} />
              <label htmlFor="charge_hobbs" className="text-sm">Charge Hobbs</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="charge_tacho" checked={chargeTacho} onCheckedChange={setChargeTacho} />
              <label htmlFor="charge_tacho" className="text-sm">Charge Tacho</label>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        </div>
        <DialogFooter className="mt-6 flex gap-2">
          <Button type="button" onClick={onClose} variant="outline" disabled={loading}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={loading} className="font-semibold px-6 py-2 text-base">
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 