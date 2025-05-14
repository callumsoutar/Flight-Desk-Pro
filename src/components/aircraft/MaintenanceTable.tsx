import { AircraftEquipment } from '@/types/aircraft';
import { Card } from '@/components/ui/card';
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';

interface MaintenanceTableProps {
  equipment: AircraftEquipment[];
  aircraftTotalHours: number;
  onEdit: (item: AircraftEquipment) => void;
}

function getStatus(item: AircraftEquipment, totalHours: number) {
  const now = new Date();
  let status: 'overdue' | 'due-soon' | 'ok' = 'ok';
  let reason = '';
  if (item.due_at_hours != null && totalHours >= item.due_at_hours) {
    status = 'overdue';
    reason = 'Hours exceeded';
  } else if (item.due_at_date && new Date(item.due_at_date) <= now) {
    status = 'overdue';
    reason = 'Date passed';
  } else if (item.due_at_hours != null && totalHours >= (item.due_at_hours - 10)) {
    status = 'due-soon';
    reason = 'Within 10 hours';
  } else if (item.due_at_date && new Date(item.due_at_date) <= new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30)) {
    status = 'due-soon';
    reason = 'Within 30 days';
  }
  return { status, reason };
}

function getDueIn(item: AircraftEquipment, aircraftTotalHours: number) {
  const dueInHours = item.due_at_hours != null ? item.due_at_hours - aircraftTotalHours : null;
  const dueInDays = item.due_at_date ? differenceInDays(new Date(item.due_at_date), new Date()) : null;
  return { dueInHours, dueInDays };
}

function statusBadge(status: 'overdue' | 'due-soon' | 'ok') {
  if (status === 'overdue') return <Badge className="bg-red-100 text-red-700 border-red-200">Overdue</Badge>;
  if (status === 'due-soon') return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Due Soon</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200">OK</Badge>;
}

export default function MaintenanceTable({ equipment, aircraftTotalHours, onEdit }: MaintenanceTableProps) {
  const rows = useMemo(() => equipment.map(item => {
    const { status } = getStatus(item, aircraftTotalHours);
    const { dueInHours, dueInDays } = getDueIn(item, aircraftTotalHours);
    return { ...item, status, dueInHours, dueInDays };
  }), [equipment, aircraftTotalHours]);

  return (
    <Card className="p-0 overflow-x-auto shadow-none bg-white border border-slate-100">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Due In (Hours)</TableHead>
            <TableHead>Due In (Days)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400 py-8">No maintenance items.</TableCell>
            </TableRow>
          )}
          {rows.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {item.dueInHours != null ? item.dueInHours.toFixed(2) : '--'}
              </TableCell>
              <TableCell>
                {item.dueInDays != null ? `${item.dueInDays} days` : '--'}
              </TableCell>
              <TableCell>{statusBadge(item.status)}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 