import { getBookingById } from './data';
import { notFound } from 'next/navigation';
import { BookingDetailsCardFull } from '@/components/bookings/booking-details-card-full';
import { BookingStages } from '@/components/bookings/booking-stages';
import { PeopleCard } from '@/components/bookings/people-card';
import React from 'react';
import { LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { AuditLogsTable } from '@/components/audit-logs/audit-logs-table';

const STAGES = [
  { key: 'briefing', label: 'Briefing' },
  { key: 'checkout', label: 'Check-out' },
  { key: 'flying', label: 'Flying' },
  { key: 'checkin', label: 'Check-in' },
];
const STATUS_TO_STAGE_IDX: Record<string, number> = {
  unconfirmed: 0,
  confirmed: 0,
  briefing: 0,
  checkout: 1,
  flying: 2,
  complete: 3,
};

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

export default async function BookingViewPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const booking = await getBookingById(id);
  if (!booking) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 pt-8 pb-12 flex flex-col gap-8">
        <div className="flex items-center justify-between pb-2 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              Booking Details
              <StatusBadge status={booking.status} />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === 'flying' && (
              <Link href={`/bookings/check-in/${booking.id}`}>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-5 py-2 rounded-lg font-semibold shadow cursor-pointer"
                  type="button"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Check Flight In
                </button>
              </Link>
            )}
            {booking.status !== 'flying' && (
              <Link href={`/bookings/check-out/${booking.id}`}>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2 rounded-lg font-semibold shadow cursor-pointer"
                  type="button"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Check Out Flight
                </button>
              </Link>
            )}
          </div>
        </div>
        {/* Progress Stepper */}
        <div className="w-full">
          <BookingStages stages={STAGES} currentStage={STATUS_TO_STAGE_IDX[booking.status] ?? 0} />
        </div>
        {/* Main Content Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-8">
          {/* Left: Booking Details */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <BookingDetailsCardFull booking={booking} editMode={true} />
          </div>
          {/* Right: People */}
          <div className="md:col-span-1 flex flex-col gap-6">
            {booking.member && <PeopleCard member={booking.member} instructor={booking.instructor} />}
          </div>
        </div>
        {/* Audit Log Table */}
        <div className="mt-8">
          <AuditLogsTable rowId={booking.id} tableName="bookings" />
        </div>
      </div>
    </div>
  );
} 