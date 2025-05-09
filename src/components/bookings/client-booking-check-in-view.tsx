"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookingStages } from '@/components/bookings/booking-stages';
import { Booking } from '@/types/bookings';
import { BookingCheckInCard } from '@/components/bookings/booking-check-in-card';
import { TabsInline } from './tabs-inline';
import { AuditLogsTable } from '@/components/audit-logs/audit-logs-table';
import { Plane, MoreVertical, Mail, CalendarClock, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    unconfirmed: 'bg-yellow-100 text-yellow-900 border border-yellow-300',
    confirmed: 'bg-green-100 text-green-900 border border-green-300',
    briefing: 'bg-blue-100 text-blue-900 border border-blue-300',
    flying: 'bg-purple-100 text-purple-900 border border-purple-300',
    complete: 'bg-blue-900 text-white border border-blue-900',
    default: 'bg-gray-100 text-gray-700 border border-gray-300',
  };
  return (
    <span
      className={`inline-flex items-center px-4 py-1 text-base rounded-full font-bold shadow-md transition-colors duration-200 border ${colorMap[status] || colorMap.default}`}
      style={{ letterSpacing: '0.02em', minHeight: '2.25rem' }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const STAGES = [
  { key: 'briefing', label: 'Briefing' },
  { key: 'checkout', label: 'Check-out' },
  { key: 'debrief', label: 'Flying' },
  { key: 'checkin', label: 'Check-in' },
];
const STATUS_TO_STAGE_IDX: Record<string, number> = {
  unconfirmed: -1,
  confirmed: -1,
  briefing: 0,
  flying: 1,
  debrief: 2,
  checkin: 3,
  complete: 3,
};

// Beautiful Invoice Generator Table
function InvoiceGenerator({ items, onEdit }: { items: { description: string; quantity: number; rate: number; total: number; }[], onEdit: (idx: number, updated: { description: string; quantity: number; rate: number; total: number; }) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<{ description: string; quantity: number; rate: number; total: number; } | null>(null);
  // Calculate subtotal, tax, and total
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.15; // 15% GST
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white/90 border border-slate-100 rounded-2xl p-8 w-full flex flex-col items-center relative"
    >
      <div className="font-bold text-xl mb-6 tracking-tight text-slate-800">Invoice</div>
      <div className="w-full overflow-x-auto">
        <Table className="w-full text-sm rounded-xl overflow-hidden">
          <TableHeader>
            <TableRow className="bg-slate-50 text-[13px] h-7">
              <TableHead className="w-[50%] text-left align-middle px-4 py-2">Description</TableHead>
              <TableHead className="text-right align-middle px-4 py-2">Qty</TableHead>
              <TableHead className="text-right align-middle px-4 py-2">Rate</TableHead>
              <TableHead className="text-right align-middle px-4 py-2">Amount</TableHead>
              <TableHead className="text-center w-12 align-middle px-2 py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-3 text-[13px] align-middle">No items</TableCell></TableRow>
            ) : items.map((item, i) => (
              <TableRow
                key={i}
                className={
                  (editIdx === i
                    ? 'bg-blue-50 '
                    : i % 2 === 0
                    ? 'bg-white '
                    : 'bg-slate-50 ') +
                  'compact-invoice-row hover:bg-slate-100 transition-colors text-[13px]'
                }
                style={{ height: '28px', paddingTop: '1px', paddingBottom: '1px' }}
              >
                {editIdx === i ? (
                  <>
                    <TableCell className="font-medium py-1 align-middle text-left px-4">{editItem?.description ?? ''}</TableCell>
                    <TableCell className="py-1 align-middle text-right px-4">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="border rounded px-3 py-1 w-24 text-sm text-right"
                        value={editItem?.quantity ?? 0}
                        onChange={e => setEditItem({ ...editItem!, quantity: Number(e.target.value), total: Number(e.target.value) * (editItem?.rate ?? 0) })}
                      />
                    </TableCell>
                    <TableCell className="py-1 align-middle text-right px-4">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="border rounded px-3 py-1 w-28 text-sm text-right"
                        value={editItem?.rate ?? 0}
                        onChange={e => setEditItem({ ...editItem!, rate: Number(e.target.value), total: (editItem?.quantity ?? 0) * Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold py-1 align-middle px-4">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="border rounded px-3 py-1 w-32 text-sm text-right"
                        value={editItem?.total ?? 0}
                        onChange={e => setEditItem({ ...editItem!, total: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell className="text-center flex gap-1 py-1 align-middle px-2">
                      <Button size="sm" variant="outline" className="px-2 py-1 text-xs" onClick={() => { onEdit(i, editItem!); setEditIdx(null); setEditItem(null); }}>Save</Button>
                      <Button size="sm" variant="ghost" className="px-2 py-1 text-xs" onClick={() => { setEditIdx(null); setEditItem(null); }}>Cancel</Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium py-1 align-middle text-left px-4">{item.description.replace(/\s*\(.*\)$/, '')}</TableCell>
                    <TableCell className="py-1 align-middle text-right px-4">{item.quantity}</TableCell>
                    <TableCell className="py-1 align-middle text-right px-4">${(item.rate * 1.15).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold py-1 align-middle px-4">${(item.total * 1.15).toFixed(2)}</TableCell>
                    <TableCell className="text-center py-1 align-middle px-2">
                      <Button size="icon" variant="ghost" className="p-1" onClick={() => { setEditIdx(i); setEditItem(item); }} title="Edit line item">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit"><path d="M11 4l2.1 2.1M4 13.5V16h2.5l7.1-7.1a2 2 0 0 0 0-2.8l-2.1-2.1a2 2 0 0 0-2.8 0L4 13.5z"/></svg>
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="w-full border-t border-slate-200 my-4" />
      <div className="w-full flex flex-col gap-1 mb-2">
        <div className="flex justify-between w-full text-base text-gray-600 font-medium">
          <span>Subtotal <span className="text-xs font-normal">(excl. Tax)</span></span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-full text-base text-gray-600 font-medium">
          <span>Tax <span className="text-xs font-normal">(15%)</span></span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-full items-center mt-4 mb-2 py-2 border-t border-b border-slate-200">
          <span className="text-xl font-bold tracking-tight text-slate-900">Total</span>
          <span className="text-2xl font-extrabold tracking-tight text-green-700">${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="w-full flex flex-row gap-4 mt-8 justify-end">
        <Button className="w-1/4 min-w-[120px] rounded-full cursor-pointer" variant="outline">Save</Button>
        <Button className="w-1/4 min-w-[150px] rounded-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white border-blue-600" variant="default">Save and Close</Button>
      </div>
    </motion.div>
  );
}

export function ClientBookingCheckInView({ booking, title }: { booking: Booking, title?: string }) {
  const [tab, setTab] = useState('flight-details');
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: number; rate: number; total: number; }[]>([]);

  // Handler to update a line item
  const handleEditInvoiceItem = (idx: number, updated: { description: string; quantity: number; rate: number; total: number; }) => {
    setInvoiceItems(items => items.map((item, i) => i === idx ? updated : item));
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 pt-8 pb-12 flex flex-col gap-8">
        {/* Breadcrumbs and Page Title, Status, and Tabs */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="text-xs text-muted-foreground font-medium mb-3">
            Bookings / Check In
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center">{title || 'Flight Check-In'}</h1>
                <span className="ml-2"><StatusBadge status={booking.status} /></span>
                {booking.aircraft?.registration && (
                  <>
                    <span className="mx-2 text-slate-300 text-lg">|</span>
                    <a
                      href={`/aircraft/view/${booking.aircraft.id}`}
                      className="flex items-center gap-1 text-blue-600 underline hover:text-blue-800 transition-colors text-base font-medium cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Plane className="w-4 h-4 inline-block text-blue-500" />
                      {booking.aircraft.registration}
                    </a>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer p-2"><MoreVertical className="w-5 h-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px]">
                  <DropdownMenuItem className="cursor-pointer"><Mail className="w-4 h-4 mr-2" />Email Member</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer"><CalendarClock className="w-4 h-4 mr-2" />Reschedule</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-red-600"><XCircle className="w-4 h-4 mr-2" />Cancel Booking</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer"><Plane className="w-4 h-4 mr-2" />View Aircraft</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {/* Progress Stepper */}
        <div className="w-full">
          <BookingStages stages={STAGES} currentStage={STATUS_TO_STAGE_IDX[booking.status] ?? 0} />
        </div>
        {/* Main Content Grid Section: 1/3 - 2/3 layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start mt-8 relative justify-center">
          {/* Left: Compact Check-In Form (1/3) */}
          <div className="md:col-span-1 flex flex-col gap-4 max-w-lg w-full mx-auto text-left">
            <div className="shadow-sm border border-slate-200 rounded-2xl">
              <BookingCheckInCard booking={booking} onCalculateCharges={setInvoiceItems} />
            </div>
          </div>
          {/* Right: Invoice Generator (2/3) */}
          <div className="md:col-span-2 flex flex-col gap-4 w-full mt-6 md:mt-0 text-left">
            <div className="shadow-sm border border-slate-200 rounded-2xl">
              <InvoiceGenerator items={invoiceItems} onEdit={handleEditInvoiceItem} />
            </div>
          </div>
        </div>
        {/* Tabs below the main grid */}
        <div className="w-full max-w-6xl mx-auto mt-4">
          <TabsInline
            tabs={[
              { label: 'Flight Details', value: 'flight-details' },
              { label: 'Charges', value: 'charges' },
              { label: 'Instructor Comments', value: 'comments' },
              { label: 'History', value: 'history' },
            ]}
            value={tab}
            onChange={setTab}
          >
            {tab === 'flight-details' && (
              <div className="w-full text-muted-foreground">Flight Details tab content (coming soon).</div>
            )}
            {tab === 'charges' && (
              <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-2">
                <div className="w-full text-muted-foreground">Charges tab coming soon.</div>
              </div>
            )}
            {tab === 'comments' && (
              <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-2">
                <div className="font-semibold text-lg mb-4">Instructor Comments</div>
                {booking.instructor_comment ? (
                  <div className="bg-slate-50 rounded-lg p-4">
                    {booking.instructor && (
                      <div className="font-semibold text-primary mb-1">
                        {booking.instructor.first_name} {booking.instructor.last_name}
                      </div>
                    )}
                    <div className="text-base whitespace-pre-line">{booking.instructor_comment}</div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-4 text-muted-foreground">
                    No instructor comments recorded for this booking.
                  </div>
                )}
              </div>
            )}
            {tab === 'history' && (
              <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-2">
                <AuditLogsTable rowId={booking.id} tableName="bookings" />
              </div>
            )}
          </TabsInline>
        </div>
      </div>
    </div>
  );
}