import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';

async function ensureUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await ensureUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { title, content, category } = body as {
    title?: string;
    content?: string;
    category?: string | null; // category name string
  };

  const updateData: Record<string, unknown> = {};
  if (typeof title !== 'undefined') updateData.title = title;
  if (typeof content !== 'undefined') updateData.content = content;
  if (typeof category !== 'undefined') updateData.category = category;

  const note = await prisma.note.update({
    where: { id, userId: user.id },
    data: updateData as Prisma.NoteUpdateInput,
  });
  return NextResponse.json(note);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await ensureUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.note.delete({
    where: { id, userId: user.id },
  });
  return NextResponse.json({ ok: true });
}
