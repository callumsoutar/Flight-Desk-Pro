import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseServerClient';

const EquipmentSchema = z.object({
  aircraft_id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  due_at_hours: z.number().nullable().optional(),
  due_at_date: z.string().datetime().nullable().optional(),
});

const EquipmentUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  due_at_hours: z.number().nullable().optional(),
  due_at_date: z.string().datetime().nullable().optional(),
});

const EquipmentDeleteSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  const parsed = EquipmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // Fetch aircraft to get org
  const { data: aircraft, error: acError } = await supabase.from('aircraft').select('organization_id').eq('id', parsed.data.aircraft_id).maybeSingle();
  if (acError || !aircraft) return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
  // Check user role in org
  const { data: orgRole } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', aircraft.organization_id)
    .maybeSingle();
  if (!orgRole || !['instructor', 'admin', 'owner'].includes(orgRole.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Insert
  const { data, error } = await supabase.from('aircraft_equipment').insert({
    aircraft_id: parsed.data.aircraft_id,
    name: parsed.data.name,
    description: parsed.data.description,
    due_at_hours: parsed.data.due_at_hours,
    due_at_date: parsed.data.due_at_date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    organization_id: aircraft.organization_id,
  }).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  const parsed = EquipmentUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // Fetch equipment to get org and aircraft
  const { data: equipment, error: eqError } = await supabase.from('aircraft_equipment').select('organization_id, aircraft_id').eq('id', parsed.data.id).maybeSingle();
  if (eqError || !equipment) return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  // Check user role in org
  const { data: orgRole } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', equipment.organization_id)
    .maybeSingle();
  if (!orgRole || !['instructor', 'admin', 'owner'].includes(orgRole.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Update
  const { id, ...rest } = parsed.data;
  const updateData: Partial<{ name: string; description?: string | null; due_at_hours?: number | null; due_at_date?: string | null; updated_at: string; }> = { ...rest, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('aircraft_equipment').update(updateData).eq('id', id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  const parsed = EquipmentDeleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // Fetch equipment to get org
  const { data: equipment, error: eqError } = await supabase.from('aircraft_equipment').select('organization_id').eq('id', parsed.data.id).maybeSingle();
  if (eqError || !equipment) return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  // Check user role in org
  const { data: orgRole } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', equipment.organization_id)
    .maybeSingle();
  if (!orgRole || !['instructor', 'admin', 'owner'].includes(orgRole.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Delete
  const { error } = await supabase.from('aircraft_equipment').delete().eq('id', parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 