'use client';

import { useState } from 'react';
import type { AircraftEquipment } from '@/types/aircraft';
import MaintenanceTable from './MaintenanceTable';
import MaintenanceViewModal from './MaintenanceViewModal';
import { Button } from '@/components/ui/button';

export default function MaintenanceTabContent({ equipment, aircraftTotalHours }: { equipment: AircraftEquipment[], aircraftTotalHours: number }) {
  const [viewItem, setViewItem] = useState<AircraftEquipment | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState<AircraftEquipment[]>(equipment);

  async function handleAdd(newItem: Partial<AircraftEquipment>) {
    const res = await fetch('/api/aircraft-equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      const created = await res.json();
      setItems(prev => [...prev, created]);
      setAddOpen(false);
    } else {
      // TODO: handle error
    }
  }

  function handleEditSave(updated: AircraftEquipment | Partial<AircraftEquipment>) {
    if ('id' in updated && updated.id) {
      setItems(prev => prev.map(i => i.id === updated.id ? updated as AircraftEquipment : i));
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200 bg-white rounded-t-xl">
        <span className="text-lg font-bold text-slate-800">Maintenance Items</span>
        <Button onClick={() => setAddOpen(true)} variant="default">Add Maintenance Item</Button>
      </div>
      <MaintenanceTable
        equipment={items}
        aircraftTotalHours={aircraftTotalHours}
        onEdit={setViewItem}
      />
      {/* Add Modal */}
      <MaintenanceViewModal
        open={addOpen}
        onOpenChange={setAddOpen}
        item={null}
        aircraftTotalHours={aircraftTotalHours}
        onSave={handleAdd}
        mode="add"
      />
      {/* Edit Modal */}
      <MaintenanceViewModal
        open={!!viewItem}
        onOpenChange={(open) => !open && setViewItem(null)}
        item={viewItem}
        aircraftTotalHours={aircraftTotalHours}
        onSave={handleEditSave}
        mode="edit"
      />
    </>
  );
} 