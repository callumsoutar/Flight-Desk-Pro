'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowserClient';

interface BookingRow {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  member: { first_name: string | null; last_name: string | null; email: string } | null;
  instructor: { first_name: string | null; last_name: string | null; email: string } | null;
  purpose: string;
  aircraft: { registration: string; type: string | null; model: string | null } | null;
}

const BOOKING_STATUSES = [
  'unconfirmed',
  'confirmed',
  'briefing',
  'flying',
  'complete',
];

// Define the type for the booking object returned from Supabase
interface SupabaseBooking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  purpose: string;
  users?: { first_name: string | null; last_name: string | null; email: string }[];
  instructor?: { first_name: string | null; last_name: string | null; email: string }[];
  aircraft?: { registration: string; type: string | null; model: string | null }[];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }
        // Get user's organization
        const { data: userOrgRows, error: userOrgError } = await supabase
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);
        if (userOrgError || !userOrgRows || userOrgRows.length === 0) {
          setError('No organization found for user');
          setLoading(false);
          return;
        }
        const orgId = userOrgRows[0].organization_id;
        // Fetch bookings with joins
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            start_time,
            end_time,
            status,
            purpose,
            user_id,
            instructor_id,
            aircraft_id,
            users:user_id (first_name, last_name, email),
            instructor:instructor_id (first_name, last_name, email),
            aircraft:aircraft_id (registration, type, model)
          `)
          .eq('organization_id', orgId)
          .order('start_time', { ascending: false });
        if (bookingsError) {
          setError('Failed to fetch bookings');
          setLoading(false);
          return;
        }
        // Map bookings to BookingRow
        const rows: BookingRow[] = (bookingsData || []).map((b: SupabaseBooking) => ({
          id: b.id,
          start_time: b.start_time,
          end_time: b.end_time,
          status: b.status,
          member: Array.isArray(b.users)
            ? (b.users.length > 0 ? b.users[0] : null)
            : (b.users ? b.users : null),
          instructor: Array.isArray(b.instructor)
            ? (b.instructor.length > 0 ? b.instructor[0] : null)
            : (b.instructor ? b.instructor : null),
          purpose: b.purpose,
          aircraft: Array.isArray(b.aircraft)
            ? (b.aircraft.length > 0 ? b.aircraft[0] : null)
            : (b.aircraft ? b.aircraft : null),
        }));
        setBookings(rows);
        setLoading(false);
      } catch {
        setError('Unexpected error');
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Stats
  const totalBookings = bookings.length;
  const today = new Date();
  const todayBookings = bookings.filter(b => {
    if (!b.start_time) return false;
    const d = new Date(b.start_time);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  }).length;
  const statusCounts: Record<string, number> = {};
  for (const status of BOOKING_STATUSES) {
    statusCounts[status] = bookings.filter(b => b.status === status).length;
  }

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Bookings</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-5 flex flex-col items-start">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Total Bookings</div>
          <div className="text-2xl font-bold text-slate-900">{totalBookings}</div>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-5 flex flex-col items-start">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Today&apos;s Bookings</div>
          <div className="text-2xl font-bold text-slate-900">{todayBookings}</div>
        </div>
        {BOOKING_STATUSES.map(status => (
          <div key={status} className="bg-white rounded-xl shadow border border-slate-200 p-5 flex flex-col items-start">
            <div className="text-xs text-slate-500 font-semibold uppercase mb-1">{status.charAt(0).toUpperCase() + status.slice(1)} Bookings</div>
            <div className="text-2xl font-bold text-slate-900">{statusCounts[status]}</div>
          </div>
        ))}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aircraft</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No bookings found.</td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/bookings/view/${b.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{b.start_time ? new Date(b.start_time).toLocaleString() : '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{b.end_time ? new Date(b.end_time).toLocaleString() : '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{b.member ? `${b.member.first_name || ''} ${b.member.last_name || ''}`.trim() || b.member.email : '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{b.instructor ? `${b.instructor.first_name || ''} ${b.instructor.last_name || ''}`.trim() || b.instructor.email : '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{b.purpose || '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{b.aircraft ? `${b.aircraft.registration}${b.aircraft.type ? ` (${b.aircraft.type}${b.aircraft.model ? ` – ${b.aircraft.model}` : ''})` : ''}` : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 