"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { InstructorComment, User } from '@/types/bookings';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';

const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty'),
});

type CommentForm = z.infer<typeof commentSchema>;

interface InstructorCommentsPanelProps {
  bookingId: string;
  currentUserId: string;
  currentUserRole: 'owner' | 'admin' | 'instructor' | 'member' | 'student';
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

// Helper to fetch instructor user details for a list of instructor_ids
async function fetchInstructors(ids: string[]): Promise<Record<string, User>> {
  if (ids.length === 0) return {};
  const res = await fetch(`/api/users?ids=${ids.join(',')}`);
  if (!res.ok) return {};
  const users: User[] = await res.json();
  return Object.fromEntries(users.map(u => [u.id, u]));
}

export function InstructorCommentsPanel({ bookingId, currentUserId, currentUserRole, buttonProps, open, onOpenChange, hideTrigger }: InstructorCommentsPanelProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all comments for this booking
  const { data: comments, isLoading, error } = useQuery<InstructorComment[], Error>({
    queryKey: ['instructor-comments', bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/instructor-comments?bookingId=${bookingId}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      return Array.isArray(data) ? data as InstructorComment[] : [];
    },
    enabled: open, // Only fetch when modal is open
  });

  // Fetch instructor user details for all unique instructor_ids in comments
  const instructorIds = Array.isArray(comments) ? Array.from(new Set(comments.map(c => c.instructor_id))) : [];
  const { data: instructors, isLoading: loadingInstructors } = useQuery<Record<string, User>>({
    queryKey: ['instructor-users', instructorIds.join(',')],
    queryFn: () => fetchInstructors(instructorIds),
    enabled: open && instructorIds.length > 0,
  });

  // Add new comment mutation
  const addMutation = useMutation({
    mutationFn: async (data: CommentForm) => {
      const res = await fetch(`/api/instructor-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, booking_id: bookingId, instructor_id: currentUserId }),
      });
      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Failed to add comment:', errorBody);
        throw new Error('Failed to add comment: ' + errorBody);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-comments', bookingId]);
      addForm.reset(); // Clear the textbox after submit
    },
  });

  // Edit comment mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const res = await fetch(`/api/instructor-comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error('Failed to update comment');
      return res.json();
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries(['instructor-comments', bookingId]);
    },
  });

  // Add comment form
  const addForm = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  // Edit comment form
  const editForm = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  // Only allow staff roles
  const canComment = ['owner', 'admin', 'instructor'].includes(currentUserRole);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          {buttonProps ? (
            <button type="button" {...buttonProps} />
          ) : (
            <Button variant="outline">View Instructor Comments</Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md w-full bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-100 p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-900">Instructor Comments</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-6 pb-6">
          {(isLoading || loadingInstructors) && <div className="flex justify-center items-center py-8"><span className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></span></div>}
          {error && <div className="text-red-500">Error loading comments: {error instanceof Error ? error.message : String(error)}</div>}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {Array.isArray(comments) && comments.length === 0 ? (
              <div className="text-muted-foreground text-center py-6">No instructor comments yet.</div>
            ) : Array.isArray(comments) && comments.length > 0 ? (
              comments.map((c: InstructorComment) => {
                const user = instructors?.[c.instructor_id];
                return (
                  <div key={c.id} className="bg-slate-50 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="font-medium text-slate-800 flex items-center gap-2 text-sm">
                        {user && user.profile_image_url && (
                          <Image src={user.profile_image_url} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        )}
                        {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : <span className="italic text-slate-400">Instructor</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-normal">
                        {format(new Date(c.created_at), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                    {editingId === c.id ? (
                      <form className="flex flex-col gap-2" onSubmit={editForm.handleSubmit((data) => editMutation.mutate({ id: c.id, comment: data.comment }))}>
                        <Textarea {...editForm.register('comment')} className="text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition" rows={2} />
                        <div className="flex gap-2 mt-1">
                          <Button type="submit" size="sm" className="rounded-full px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition">Save</Button>
                          <Button type="button" size="sm" variant="ghost" className="rounded-full px-4" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                        {editForm.formState.errors.comment && <div className="text-xs text-red-500">{editForm.formState.errors.comment.message}</div>}
                      </form>
                    ) : (
                      <div className="text-sm text-slate-700 whitespace-pre-line">{c.comment}</div>
                    )}
                    {c.instructor_id === currentUserId && canComment && editingId !== c.id && (
                      <Button size="sm" variant="ghost" className="ml-auto px-2 py-0.5 text-xs mt-1 rounded-full hover:bg-blue-50 transition" onClick={() => { setEditingId(c.id); editForm.setValue('comment', c.comment); }}>Edit</Button>
                    )}
                  </div>
                );
              })
            ) : null}
          </div>
          {canComment && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <form className="flex flex-col gap-1" onSubmit={addForm.handleSubmit((data) => addMutation.mutate(data))}>
                <label htmlFor="new-comment" className="text-xs text-slate-500 mb-1 font-medium">
                  Add a new instructor comment
                </label>
                <Textarea
                  id="new-comment"
                  {...addForm.register('comment')}
                  className="text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-200 transition shadow-sm"
                  rows={2}
                  placeholder="Type your comment here..."
                />
                <div className="flex gap-2 mt-1 justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-150 focus:ring-2 focus:ring-blue-300 focus:outline-none active:scale-98 border border-blue-700/10 shadow-none cursor-pointer"
                    disabled={addMutation.isLoading}
                  >
                    Add Comment
                  </Button>
                </div>
                {addForm.formState.errors.comment && (
                  <div className="text-xs text-red-500">{addForm.formState.errors.comment.message}</div>
                )}
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 