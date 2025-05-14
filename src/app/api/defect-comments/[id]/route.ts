import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseServerClient';

const DefectCommentPatchSchema = z.object({
  comment: z.string().min(1),
});

// @ts-expect-error Next.js App Router context must be untyped
export async function PATCH(req: NextRequest, context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = context.params;
  const body = await req.json();
  const parsed = DefectCommentPatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // Fetch comment
  const { data: commentRow, error: fetchError } = await supabase.from('defect_comments').select('*').eq('id', id).maybeSingle();
  if (fetchError || !commentRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (commentRow.user_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  // Update
  const { data: updated, error } = await supabase
    .from('defect_comments')
    .update({ comment: parsed.data.comment })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(updated);
}

// @ts-expect-error Next.js App Router context must be untyped
export async function DELETE(req: NextRequest, context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = context.params;
  // Fetch comment
  const { data: commentRow, error: fetchError } = await supabase.from('defect_comments').select('*').eq('id', id).maybeSingle();
  if (fetchError || !commentRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (commentRow.user_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  // Delete
  const { error } = await supabase.from('defect_comments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 