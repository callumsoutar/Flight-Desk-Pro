import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseServerClient';

const DefectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  status: z.enum(['low', 'medium', 'high']).optional(),
  defect_stage: z.enum(['open', 'investigating', 'monitoring', 'closed']).optional(),
  resolved_at: z.string().datetime().optional().nullable(),
  closed_by: z.string().uuid().optional().nullable(),
  aircraft_id: z.string().uuid().optional().nullable(),
});

export async function GET() {
  const supabase = await createClient();
  // Get current user and their orgs
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  // Get user's orgs and roles
  const { data: orgs, error: orgsError } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id);
  if (orgsError || !orgs) return NextResponse.json({ error: 'No organizations found' }, { status: 403 });
  // Only allow instructor, admin, owner
  const allowedRoles = ['instructor', 'admin', 'owner'];
  const allowedOrgIds = orgs.filter(o => allowedRoles.includes(o.role)).map(o => o.organization_id);
  if (allowedOrgIds.length === 0) return NextResponse.json([], { status: 200 });
  // Fetch defects for allowed orgs
  const { data, error } = await supabase
    .from('defects')
    .select('*')
    .in('organization_id', allowedOrgIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  // Validate
  const parsed = DefectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { name, description, status, defect_stage, resolved_at, closed_by, organization_id, aircraft_id } = { ...parsed.data, ...body };
  if (!organization_id || !aircraft_id) return NextResponse.json({ error: 'Missing organization_id or aircraft_id' }, { status: 400 });
  // Check user role in org
  const { data: orgRole } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', organization_id)
    .maybeSingle();
  if (!orgRole || !['instructor', 'admin', 'owner'].includes(orgRole.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Insert
  const { data, error } = await supabase
    .from('defects')
    .insert({
      organization_id,
      user_id: user.id,
      name,
      description,
      status: status || 'low',
      defect_stage: defect_stage || 'open',
      resolved_at,
      closed_by,
      aircraft_id,
    })
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
} 