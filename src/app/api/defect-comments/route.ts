import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseServerClient';

const DefectCommentSchema = z.object({
  defect_id: z.string().uuid(),
  comment: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const defect_id = searchParams.get('defect_id');
  if (!defect_id) return NextResponse.json({ error: 'Missing defect_id' }, { status: 400 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  // Fetch defect to get org
  const { data: defect } = await supabase.from('defects').select('organization_id').eq('id', defect_id).maybeSingle();
  if (!defect) return NextResponse.json({ error: 'Defect not found' }, { status: 404 });
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
  // Fetch comments
  const { data, error } = await supabase
    .from('defect_comments')
    .select('*')
    .eq('defect_id', defect_id)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  const parsed = DefectCommentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { defect_id, comment } = parsed.data;
  // Insert
  const { data, error } = await supabase
    .from('defect_comments')
    .insert({
      defect_id,
      user_id: user.id,
      comment,
    })
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
} 