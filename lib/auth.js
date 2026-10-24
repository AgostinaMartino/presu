import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'sesion';

function requerirConfig() {
  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
    throw new Error('Faltan las variables APP_PASSWORD y/o SESSION_SECRET en Vercel.');
  }
}

export function tokenEsperado() {
  requerirConfig();
  return crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(process.env.APP_PASSWORD)
    .digest('hex');
}

function igualesSeguro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function passwordCorrecta(intento) {
  requerirConfig();
  return igualesSeguro(intento || '', process.env.APP_PASSWORD);
}

export function estaAutenticada() {
  try {
    const valor = cookies().get(COOKIE_NAME)?.value;
    if (!valor) return false;
    return igualesSeguro(valor, tokenEsperado());
  } catch (e) {
    return false;
  }
}
