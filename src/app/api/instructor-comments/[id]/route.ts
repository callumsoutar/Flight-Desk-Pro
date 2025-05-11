import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

// @ts-expect-error Next.js App Router context must be untyped
export async function PATCH(req: NextRequest, context) {
  const supabase = await createClient();
  const { id } = context.params;
  try {
    const body = await req.json();
    const { comment } = body;
    if (!comment) {
      return NextResponse.json({ error: 'Missing comment' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('instructor_comments')
      .update({ comment })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('[API PATCH] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API PATCH] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
} 