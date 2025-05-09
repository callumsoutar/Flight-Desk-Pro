import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

const FIELD_LABELS: Record<string, string> = {
  aircraft_id: 'aircraft',
  instructor_id: 'instructor',
  start_time: 'start time',
  end_time: 'end time',
  purpose: 'description',
  remarks: 'remarks',
  updated_at: 'updated at',
};

const IGNORED_FIELDS = ['updated_at', 'created_at', 'organization_id', 'id', 'user_id'];

function formatValue(field: string, value: unknown) {
  if (value === null || value === undefined) return '—';
  if (field.endsWith('_at') && typeof value === 'string') {
    return new Date(value).toLocaleString();
  }
  return String(value);
}

function formatAuditDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rowId = searchParams.get('rowId');
  const tableName = searchParams.get('tableName');
  if (!rowId || !tableName) {
    return NextResponse.json({ logs: [] }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, changed_by, changed_at, column_changes')
    .eq('row_id', rowId)
    .eq('table_name', tableName)
    .order('changed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ logs: [], error: error.message }, { status: 500 });
  }

  // Collect all userIds, aircraftIds, instructorIds to resolve in batch
  const userIds = Array.from(new Set(data.map((log: Record<string, unknown>) => log.changed_by).filter(Boolean)));
  const aircraftIds = Array.from(new Set(
    data.flatMap((log: Record<string, any>) =>
      log.column_changes ? [log.column_changes.aircraft_id?.old, log.column_changes.aircraft_id?.new] : []
    ).filter(Boolean)
  ));
  const instructorIds = Array.from(new Set(
    data.flatMap((log: Record<string, any>) =>
      log.column_changes ? [log.column_changes.instructor_id?.old, log.column_changes.instructor_id?.new] : []
    ).filter(Boolean)
  ));

  // Batch fetch users and aircraft
  const [usersRes, aircraftRes, instructorsRes] = await Promise.all([
    userIds.length
      ? supabase.from('users').select('id, first_name, last_name').in('id', userIds)
      : Promise.resolve({ data: [] }),
    aircraftIds.length
      ? supabase.from('aircraft').select('id, registration').in('id', aircraftIds)
      : Promise.resolve({ data: [] }),
    instructorIds.length
      ? supabase.from('users').select('id, first_name, last_name').in('id', instructorIds)
      : Promise.resolve({ data: [] }),
  ]);
  const userMap = Object.fromEntries((usersRes.data || []).map((u: Record<string, any>) => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]));
  const aircraftMap = Object.fromEntries((aircraftRes.data || []).map((a: Record<string, any>) => [a.id, a.registration]));
  const instructorMap = Object.fromEntries((instructorsRes.data || []).map((u: Record<string, any>) => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]));

  // Build user-friendly messages
  const logs = await Promise.all(
    data.map(async (log: Record<string, any>) => {
      const user = userMap[log.changed_by] || 'Someone';
      const date = formatAuditDate(log.changed_at);
      const descriptions: string[] = [];
      if (log.column_changes) {
        for (const [field, value] of Object.entries(log.column_changes)) {
          if (IGNORED_FIELDS.includes(field)) continue;
          const label = FIELD_LABELS[field] || field.replace(/_/g, ' ');
          let oldDisplay = '—';
          let newDisplay = '—';
          if (value && typeof value === 'object' && 'old' in value && 'new' in value) {
            oldDisplay = formatValue(field, value.old);
            newDisplay = formatValue(field, value.new);
            if (field === 'aircraft_id') {
              oldDisplay = aircraftMap[String(value.old)] || oldDisplay;
              newDisplay = aircraftMap[String(value.new)] || newDisplay;
            }
            if (field === 'instructor_id') {
              oldDisplay = instructorMap[String(value.old)] || oldDisplay;
              newDisplay = instructorMap[String(value.new)] || newDisplay;
            }
          }
          descriptions.push(`${label.charAt(0).toUpperCase() + label.slice(1)} changed from "${oldDisplay}" to "${newDisplay}"`);
        }
      }
      if (descriptions.length === 0) {
        if (log.action === 'INSERT') {
          descriptions.push('Booking Created');
        } else if (log.action === 'DELETE') {
          descriptions.push('Booking Deleted');
        } else if (log.action === 'UPDATE') {
          descriptions.push('Booking Updated');
        }
      }
      return {
        date,
        user,
        description: descriptions.join('; '),
      };
    })
  );

  return NextResponse.json({ logs });
} 