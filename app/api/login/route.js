import { NextResponse } from 'next/server';
import { COOKIE_NAME, passwordCorrecta, tokenEsperado } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (!passwordCorrecta(password)) {
      // Pequeña demora para desalentar intentos automáticos
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ error: 'Clave incorrecta.' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, tokenEsperado(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
