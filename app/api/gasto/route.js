import { NextResponse } from 'next/server';
import { estaAutenticada } from '../../../lib/auth';
import { llamarScript } from '../../../lib/gas';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  if (!estaAutenticada()) {
    return NextResponse.json({ error: 'No autorizada.' }, { status: 401 });
  }
  try {
    const { fila, col, importe, estimado, detalle, mesLabel } = await request.json();
    const resultado = await llamarScript({
      action: 'gasto',
      fila,
      col,
      importe,
      estimado,
      detalle,
      mesLabel
    });
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
