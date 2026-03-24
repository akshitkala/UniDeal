import { connectDB } from '@/lib/db/connect';
import { requireAdmin } from '@/middleware/auth';
import Report from '@/models/Report';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  await connectDB();
  const { status } = await req.json();
  const report = await Report.findByIdAndUpdate(params.id, { status }, { new: true });
  return NextResponse.json({ report });
}
