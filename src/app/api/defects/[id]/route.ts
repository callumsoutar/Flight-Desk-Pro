import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseServerClient';

const DefectPatchSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['low', 'medium', 'high']).optional(),
  defect_stage: z.enum(['open', 'investigating', 'monitoring', 'closed']).optional(),
  resolved_at: z.string().datetime().optional().nullable(),
  closed_by: z.string().uuid().optional().nullable(),
  resolution_comments: z.string().optional().nullable(),
});

// @ts-expect-error Next.js App Router context must be untyped
export async function GET(req: NextRequest, context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = context.params;
  // Fetch defect
  const { data: defect, error } = await supabase.from('defects').select('*').eq('id', id).maybeSingle();
  if (error || !defect) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Check user role in org
  const { data: orgRole } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', defect.organization_id)
    .maybeSingle();
  if (!orgRole || !['instructor', 'admin', 'owner'].includes(orgRole.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  return NextResponse.json(defect);
}

// @ts-expect-error Next.js App Router context must be untyped
export async function PATCH(req: NextRequest, context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = context.params;
  const body = await req.json();
  const parsed = DefectPatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // Fetch defect
  const { data: defect, error: fetchError } = await supabase.from('defects').select('*').eq('id', id).maybeSingle();
  if (fetchError || !defect) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Check user role in org
  const { data: orgRole } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', defect.organization_id)
    .maybeSingle();
  if (!orgRole || !['instructor', 'admin', 'owner'].includes(orgRole.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Update
  const { data: updated, error } = await supabase
    .from('defects')
    .update(parsed.data)
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
  // Fetch defect
  const { data: defect, error: fetchError } = await supabase.from('defects').select('*').eq('id', id).maybeSingle();
  if (fetchError || !defect) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Check user role in org
  const { data: orgRole } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', defect.organization_id)
    .maybeSingle();
  if (!orgRole || !['instructor', 'admin', 'owner'].includes(orgRole.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Delete
  const { error } = await supabase.from('defects').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 