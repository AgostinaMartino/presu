// Llamadas al Apps Script publicado como aplicación web.
// La URL y el token viven solo en el servidor (variables de entorno de Vercel):
// el navegador nunca los ve.

export async function llamarScript(payload) {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;
  if (!url || !token) {
    throw new Error('Faltan las variables APPS_SCRIPT_URL y/o APPS_SCRIPT_TOKEN en Vercel.');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, token }),
    redirect: 'follow',
    cache: 'no-store'
  });

  const texto = await res.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch (e) {
    throw new Error(
      'El script de Google no respondió como se esperaba. Revisá que esté implementado como aplicación web con acceso "Cualquier persona" y que la URL termine en /exec.'
    );
  }
  if (!json.ok) throw new Error(json.error || 'Error en el script de Google.');
  return json.data;
}
