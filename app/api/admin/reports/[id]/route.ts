import { connectDB } from '@/lib/db/connect';
import { requireAdmin } from '@/middleware/auth';
import { Report } from '@/models/Report';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  const [paramsData, body] = await Promise.all([
    params,
    req.json()
  ]);
  const { id } = paramsData;
  const { status } = body;
  await connectDB();
  const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
  return NextResponse.json({ report });
}
