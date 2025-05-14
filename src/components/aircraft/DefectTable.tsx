"use client";
import { useState } from 'react';
import type { Defect } from '@/types/defects';
import DefectViewModal from '@/components/aircraft/DefectViewModal';
import { Button } from '@/components/ui/button';

export default function DefectTable({ defects }: { defects: Defect[] }) {
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  if (!defects || defects.length === 0) {
    return <div className="px-4 py-8 text-center text-slate-400">No defects</div>;
  }
  return (
    <>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">View</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {defects.map(defect => (
            <tr key={defect.id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{defect.name}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 capitalize">{defect.status}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{new Date(defect.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <Button asChild size="sm" variant="outline" onClick={() => { setSelectedDefect(defect); setModalOpen(true); }}>
                  <span>View</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedDefect && (
        <DefectViewModal
          defect={selectedDefect}
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedDefect(null); }}
        />
      )}
    </>
  );
} 