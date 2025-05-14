"use client";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Defect, DefectComment, DefectStage } from '@/types/defects';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Send, Wrench } from 'lucide-react';

const DEFECT_STAGE_OPTIONS: DefectStage[] = ['open', 'investigating', 'monitoring', 'closed'];
const STAGE_COLORS: Record<DefectStage, string> = {
  open: 'bg-blue-100 text-blue-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  monitoring: 'bg-purple-100 text-purple-800',
  closed: 'bg-green-100 text-green-800',
};

export default function DefectViewModal({ defect, open, onClose }: { defect: Defect, open: boolean, onClose: () => void }) {
  const [stage, setStage] = useState<DefectStage>(defect.defect_stage);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<DefectComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingStage, setPendingStage] = useState<DefectStage>(defect.defect_stage);
  const [pendingName] = useState(defect.name);
  const [pendingDescription, setPendingDescription] = useState(defect.description || '');
  const [showResolutionInput, setShowResolutionInput] = useState(false);
  const [resolutionComments, setResolutionComments] = useState('');
  const [resolvedAt, setResolvedAt] = useState(() => new Date().toISOString().slice(0, 16)); // ISO string for datetime-local
  const [aircraftRegistration, setAircraftRegistration] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, { id: string; first_name: string | null; last_name: string | null; profile_image_url?: string | null }>>({});

  // Track unsaved changes
  const hasUnsavedChanges =
    pendingStage !== defect.defect_stage ||
    pendingDescription !== (defect.description || '');

  useEffect(() => {
    if (open) {
      setStage(defect.defect_stage);
      setComment('');
      setError(null);
      setLoadingComments(true);
      fetch(`/api/defect-comments?defect_id=${defect.id}`)
        .then(res => res.json())
        .then(async (data: DefectComment[]) => {
          if (!Array.isArray(data)) return setComments([]);
          setComments(data);
          // Fetch user details for avatars
          const userIds = Array.from(new Set(data.map((c) => c.user_id).filter(Boolean)));
          if (userIds.length > 0) {
            const res = await fetch(`/api/users?ids=${userIds.join(',')}`);
            if (res.ok) {
              const users: { id: string; first_name: string | null; last_name: string | null; profile_image_url?: string | null }[] = await res.json();
              const map: Record<string, { id: string; first_name: string | null; last_name: string | null; profile_image_url?: string | null }> = {};
              users.forEach((u) => { map[u.id] = u; });
              setUserMap(map);
            }
          } else {
            setUserMap({});
          }
        })
        .catch(() => { setComments([]); setUserMap({}); })
        .finally(() => setLoadingComments(false));
      // Fetch aircraft registration
      if (defect.aircraft_id) {
        fetch(`/api/aircraft?id=${defect.aircraft_id}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) setAircraftRegistration(data[0].registration);
            else if (data && data.registration) setAircraftRegistration(data.registration);
            else setAircraftRegistration(null);
          })
          .catch(() => setAircraftRegistration(null));
      } else {
        setAircraftRegistration(null);
      }
    }
  }, [open, defect]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setAddingComment(true);
    setError(null);
    const newComment: Partial<DefectComment> = {
      defect_id: defect.id,
      comment,
    };
    try {
      const res = await fetch('/api/defect-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setComment('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAddingComment(false);
    }
  };

  const handleResolve = () => {
    setShowResolutionInput(true);
    setResolutionComments('');
    setResolvedAt(new Date().toISOString().slice(0, 16));
  };

  const handleConfirmResolution = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/defects/${defect.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defect_stage: 'closed',
          resolution_comments: resolutionComments,
          resolved_at: new Date(resolvedAt).toISOString(),
          // closed_by will be set in the API using the current user
        }),
      });
      if (!res.ok) throw new Error('Failed to resolve defect');
      setShowResolutionInput(false);
      onClose(); // Optionally, you can refetch or update state here
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelResolution = () => {
    setShowResolutionInput(false);
    setResolutionComments('');
    setResolvedAt(new Date().toISOString().slice(0, 16));
  };

  // Save handler for status/stage/name/description
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/defects/${defect.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defect_stage: pendingStage,
          description: pendingDescription,
        }),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      setStage(pendingStage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1280px] min-w-[900px] w-full min-h-[600px] max-h-[90vh] p-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl shadow-2xl border-0 overflow-hidden flex flex-col">
        <DialogTitle asChild>
          <VisuallyHidden>{pendingName || "Defect Details"}</VisuallyHidden>
        </DialogTitle>
        {/* Main content area: two columns */}
        <div className="flex-1 flex flex-col md:flex-row gap-0 h-full">
          {/* Accent bar */}
          <div className="hidden md:block w-2 rounded-l-2xl bg-gradient-to-b from-red-500 to-orange-400" />
          {/* Left: Defect Info & Actions */}
          <div className="flex-1 flex flex-col gap-6 p-10 min-w-[400px] overflow-y-auto">
            {/* Header with icon and name */}
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 rounded-full p-3 flex items-center justify-center">
                <Wrench className="w-7 h-7 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2">
                  {aircraftRegistration && (
                    <div className="text-xs text-slate-500 font-medium mb-1">Aircraft: <span className="font-semibold text-slate-700">{aircraftRegistration}</span></div>
                  )}
                  <span className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-0.5 break-words whitespace-normal">{pendingName}</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-base font-semibold bg-slate-200 text-slate-700">{pendingStage.charAt(0).toUpperCase() + pendingStage.slice(1)}</span>
                    <span className="text-xs text-slate-400 font-medium">Created: {new Date(defect.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">Description</div>
              <Textarea
                value={pendingDescription}
                onChange={e => setPendingDescription(e.target.value)}
                className="text-base text-slate-800 leading-relaxed bg-white border-slate-200"
                rows={4}
                maxLength={512}
                aria-label="Defect description"
              />
            </div>
            <div className="flex flex-row gap-6 mt-2">
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-medium mb-1">Stage</div>
                <Select value={pendingStage} onValueChange={v => setPendingStage(v as DefectStage)} disabled={saving}>
                  <SelectTrigger className={`w-full border-slate-300 rounded-lg shadow-sm ${STAGE_COLORS[pendingStage]}`}> 
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFECT_STAGE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className={STAGE_COLORS[opt]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            {/* Resolution input (if open) */}
            {showResolutionInput && (
              <div className="w-full flex flex-col gap-4 border border-slate-200 rounded-xl bg-slate-50 p-6 mt-2">
                <div className="text-lg font-semibold text-slate-900 mb-1">Resolution</div>
                <Textarea
                  value={resolutionComments}
                  onChange={e => setResolutionComments(e.target.value)}
                  placeholder="Enter resolution details..."
                  className="w-full border-slate-300 rounded-lg shadow-sm min-h-[64px]"
                  rows={3}
                  required
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 min-w-[100px]">Resolved At:</label>
                  <input
                    type="datetime-local"
                    value={resolvedAt}
                    onChange={e => setResolvedAt(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
                  <Button
                    onClick={handleConfirmResolution}
                    disabled={saving || !resolutionComments.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow min-w-[140px] text-base w-full sm:w-auto"
                  >
                    {saving ? 'Saving...' : 'Confirm Resolution'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelResolution} className="min-w-[100px] w-full sm:w-auto">Cancel</Button>
                </div>
                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              </div>
            )}
          </div>
          {/* Right: Comments & Audit Log */}
          <div className="flex-1 flex flex-col gap-4 p-10 border-l border-slate-200 bg-slate-50 min-w-[400px]">
            <div className="text-2xl font-extrabold mb-2 text-slate-900">Comments</div>
            {/* Add comment box */}
            <div className="w-full flex items-end gap-2 mb-2">
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border-slate-300 rounded-lg shadow-sm min-h-[48px]"
                rows={2}
                disabled={addingComment}
                aria-label="Add a comment"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={addingComment || !comment.trim()}
                className={`p-2 rounded-full focus:outline-none ${addingComment || !comment.trim() ? 'bg-blue-200 text-blue-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors`}
                aria-label="Send comment"
                tabIndex={0}
                style={{ alignSelf: 'flex-end' }}
              >
                <Send size={20} />
              </button>
            </div>
            {/* Scrollable comment history */}
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 overflow-y-auto min-h-[120px] max-h-[340px]">
              {loadingComments ? (
                <div className="text-slate-400 text-xs">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-slate-400 text-xs">No comments yet.</div>
              ) : comments.map((c, idx) => {
                const user = userMap[c.user_id];
                const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '';
                return (
                  <div key={c.id ?? `${c.created_at}-${idx}`} className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-0.5">
                      {user?.profile_image_url ? (
                        <AvatarImage src={user.profile_image_url} alt={user.first_name || ''} />
                      ) : (
                        <AvatarFallback>{initials || '?'}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                      <div className="text-sm text-slate-900 whitespace-pre-line">{c.comment}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Sticky Footer */}
        <DialogFooter className="sticky bottom-0 left-0 w-full bg-gradient-to-br from-slate-100 to-white border-t border-slate-200 px-10 py-6 flex gap-4 justify-end z-10">
          {!showResolutionInput && (
            <>
              {stage !== 'closed' && (
                <Button size="lg" onClick={handleResolve} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow min-w-[140px] text-base">
                  Resolve
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasUnsavedChanges || saving} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow min-w-[140px] text-base">
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={onClose} className="min-w-[140px] px-8 py-3 text-base font-semibold">
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 