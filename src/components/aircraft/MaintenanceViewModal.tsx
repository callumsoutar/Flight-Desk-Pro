'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wrench } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { AircraftEquipment } from '@/types/aircraft';
import { differenceInDays } from 'date-fns';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

function statusBadge(status: 'overdue' | 'due-soon' | 'ok') {
  if (status === 'overdue') return <Badge className="bg-red-100 text-red-700 border-red-200 text-base px-3 py-1">Overdue</Badge>;
  if (status === 'due-soon') return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-base px-3 py-1">Due Soon</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200 text-base px-3 py-1">OK</Badge>;
}

function getStatus(item: AircraftEquipment, totalHours: number) {
  const now = new Date();
  if (item.due_at_hours != null && totalHours >= item.due_at_hours) return 'overdue';
  if (item.due_at_date && new Date(item.due_at_date) <= now) return 'overdue';
  if (item.due_at_hours != null && totalHours >= (item.due_at_hours - 10)) return 'due-soon';
  if (item.due_at_date && new Date(item.due_at_date) <= new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30)) return 'due-soon';
  return 'ok';
}

function getDueIn(item: AircraftEquipment, aircraftTotalHours: number) {
  const dueInHours = item.due_at_hours != null ? item.due_at_hours - aircraftTotalHours : null;
  const dueInDays = item.due_at_date ? differenceInDays(new Date(item.due_at_date), new Date()) : null;
  return { dueInHours, dueInDays };
}

export default function MaintenanceViewModal({
  open,
  onOpenChange,
  item,
  aircraftTotalHours,
  onSave,
  mode = 'edit',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AircraftEquipment | null;
  aircraftTotalHours: number;
  onSave?: (updated: AircraftEquipment | Partial<AircraftEquipment>) => void;
  mode?: 'add' | 'edit';
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edited, setEdited] = useState<AircraftEquipment | Partial<AircraftEquipment> | null>(mode === 'add' ? {
    name: '',
    description: '',
    due_at_hours: null,
    due_at_date: null,
    aircraft_id: item?.aircraft_id,
  } : item);

  // Sync edited state with item prop
  React.useEffect(() => {
    setEdited(mode === 'add' ? {
      name: '',
      description: '',
      due_at_hours: null,
      due_at_date: null,
      aircraft_id: item?.aircraft_id,
    } : item);
    setError(null);
  }, [item, mode]);

  if ((mode === 'edit' && (!item || !edited)) || !edited) return null;
  const status = mode === 'edit' ? getStatus(edited as AircraftEquipment, aircraftTotalHours) : 'ok';
  const { dueInHours, dueInDays } = mode === 'edit' ? getDueIn(edited as AircraftEquipment, aircraftTotalHours) : { dueInHours: null, dueInDays: null };

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      if (!edited!.name || edited!.name.length < 2) {
        setError('Name must be at least 2 characters');
        setLoading(false);
        return;
      }
      if (mode === 'add') {
        if (onSave && edited) await onSave(edited);
        onOpenChange(false);
      } else {
        const patchBody = {
          id: (edited as AircraftEquipment).id,
          name: edited!.name,
          description: edited!.description,
          due_at_hours: edited!.due_at_hours,
          due_at_date: edited!.due_at_date
            ? new Date(edited!.due_at_date).toISOString()
            : null,
        };
        console.log('PATCH body', patchBody);
        const res = await fetch('/api/aircraft-equipment', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody),
        });
        if (!res.ok) {
          const data = await res.json();
          let errMsg = data.error;
          if (typeof errMsg === 'object') {
            errMsg = JSON.stringify(errMsg);
          }
          setError(errMsg || 'Failed to update');
          setLoading(false);
          return;
        }
        const updated = await res.json();
        if (onSave) onSave(updated);
        onOpenChange(false);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl shadow-2xl border-0">
        <DialogTitle asChild>
          <VisuallyHidden>{edited!.name || 'Maintenance Item'}</VisuallyHidden>
        </DialogTitle>
        <div className="flex flex-col md:flex-row">
          {/* Accent bar */}
          <div className="hidden md:block w-2 rounded-l-2xl bg-gradient-to-b from-blue-500 to-purple-500" />
          <div className="flex-1 p-8">
            {/* Header with icon and name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 rounded-full p-3 flex items-center justify-center">
                <Wrench className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2">
                  <span className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-0.5 truncate">{edited!.name}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-block">{statusBadge(status)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="text-xs text-slate-500 font-medium mb-1">Description</div>
              <Textarea
                className="text-base text-slate-800 leading-relaxed bg-white border-slate-200"
                value={edited!.description || ''}
                onChange={e => setEdited({ ...edited!, description: e.target.value })}
                aria-label="Description"
                rows={3}
                maxLength={512}
              />
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">Due At (Hours)</div>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  className="text-lg font-semibold text-blue-700 bg-white border-slate-200"
                  value={edited!.due_at_hours ?? ''}
                  onChange={e => setEdited({ ...edited!, due_at_hours: e.target.value === '' ? null : parseFloat(e.target.value) })}
                  aria-label="Due At Hours"
                />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">Due At (Date)</div>
                <Input
                  type="date"
                  className="text-lg font-semibold text-blue-700 bg-white border-slate-200"
                  value={edited!.due_at_date ? new Date(edited!.due_at_date).toISOString().slice(0, 10) : ''}
                  onChange={e => setEdited({
                    ...edited!,
                    due_at_date: e.target.value
                      ? new Date(e.target.value + 'T00:00:00.000Z').toISOString()
                      : null
                  })}
                  aria-label="Due At Date"
                />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">Due In (Hours)</div>
                <div className="text-lg font-semibold text-purple-700">{dueInHours != null ? `${dueInHours.toFixed(2)}h` : '--'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">Due In (Days)</div>
                <div className="text-lg font-semibold text-purple-700">{dueInDays != null ? `${dueInDays} days` : '--'}</div>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <DialogFooter className="mt-8 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="px-6 py-2 text-base font-semibold" disabled={loading}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} className="px-6 py-2 text-base font-semibold" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 