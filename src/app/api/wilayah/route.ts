import { NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';

export async function GET() {
  const data = await dtdRepository.getWilayahHierarchy();
  return NextResponse.json(data);
}
