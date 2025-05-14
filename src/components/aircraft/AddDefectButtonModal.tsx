"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AddDefectButtonModalProps {
  aircraftId: string;
  organizationId: string;
  buttonProps?: React.ComponentProps<typeof Button>;
}

export default function AddDefectButtonModal({ aircraftId, organizationId, buttonProps }: AddDefectButtonModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          status,
          aircraft_id: aircraftId,
          organization_id: organizationId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add defect');
      }
      // const data = await res.json();
      setName('');
      setDescription('');
      setStatus('low');
    } catch (err: unknown) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end px-4 pt-4 pb-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button {...buttonProps}>Add Defect</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl shadow-2xl p-8 bg-white border border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Add Defect</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label htmlFor="defect_name" className="block text-sm font-semibold mb-2 text-slate-700">Name</label>
                <Input id="defect_name" value={name} onChange={e => setName(e.target.value)} required className="w-full border-slate-300 rounded-lg shadow-sm" />
              </div>
              <div>
                <label htmlFor="defect_description" className="block text-sm font-semibold mb-2 text-slate-700">Description</label>
                <Textarea id="defect_description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm" />
              </div>
              <div>
                <label htmlFor="defect_status" className="block text-sm font-semibold mb-2 text-slate-700">Status</label>
                <Select value={status} onValueChange={v => setStatus(v as 'low' | 'medium' | 'high')}>
                  <SelectTrigger className="w-full border-slate-300 rounded-lg shadow-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={buttonProps?.onClick} disabled={loading}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading || !name}>
                {loading ? 'Adding...' : 'Add Defect'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 