// app/api/status/[jobId]/route.ts
import { NextResponse } from 'next/server';

const jobStore = new Map(); // In-memory; use DB for prod

export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const job = jobStore.get(jobId) || { status: 'not_found' };
  return NextResponse.json({ jobId, ...job });
}