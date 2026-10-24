import { NextResponse } from 'next/server';
import { estaAutenticada } from '../../../lib/auth';
import { llamarScript } from '../../../lib/gas';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  if (!estaAutenticada()) {
    return NextResponse.json({ error: 'No autorizada.' }, { status: 401 });
  }
  try {
    return NextResponse.json(await llamarScript({ action: 'estructura' }));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
