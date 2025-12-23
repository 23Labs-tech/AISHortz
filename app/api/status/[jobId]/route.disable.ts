// app/api/status/[jobId]/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

const jobStore = new Map(); // In-memory; use DB for prod

export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const job = jobStore.get(jobId) || { status: 'not_found' };
  return NextResponse.json({ jobId, ...job });
}