"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AircraftWithDetails } from '@/types/aircraft';

function AircraftTable({ aircraft }: { aircraft: AircraftWithDetails[] }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Registration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Manufacturer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Hours</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {aircraft.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No aircraft found.</td>
            </tr>
          )}
          {aircraft.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/aircraft/view/${a.id}`)}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/aircraft/view/${a.id}`); }}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{a.registration}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{a.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{a.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{a.manufacturer || '--'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{a.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{a.total_hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<AircraftWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAircraft = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/aircraft');
        if (!res.ok) {
          setError('Failed to fetch aircraft');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setAircraft(data);
      } catch {
        setError('Unexpected error');
      } finally {
        setLoading(false);
      }
    };
    fetchAircraft();
  }, []);

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Aircraft</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && <AircraftTable aircraft={aircraft} />}
    </div>
  );
} 