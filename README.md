# Presupuesto mensual — front en Vercel + Apps Script

La planilla sigue siendo manejada por el **Apps Script** (no hace falta Google Cloud).
Vercel solo pone el front lindo: le habla al script por atrás, con una clave secreta,
y el navegador nunca ve la URL del script ni el token.

Cada gasto cargado:

1. Suma el importe al número de la celda (categoría × mes) de **Pres 2026**.
2. Guarda el estimado como nota de la celda (si lo completás).
3. Agrega **una fila** en la pestaña **Registro de gastos** (se crea sola la primera vez): fecha y hora, categoría, mes, importe, estimado, detalle, valor anterior y valor nuevo de la celda, y qué celda fue.

Si la celda tiene una **fórmula**, no la pisa y te avisa.

## Paso 1 — Actualizar el Apps Script

1. En la planilla: **Extensiones → Apps Script**.
2. Reemplazá **todo** el contenido de `Code.gs` por el del archivo `Code.gs` que te pasé. (`Dialogo.html` no cambia.)
3. Click en el engranaje **⚙️ Configuración del proyecto** (columna izquierda) → bajá hasta **Propiedades de la secuencia de comandos** → **Agregar propiedad**:
   - Propiedad: `TOKEN`
   - Valor: un texto largo al azar (ej: 30 letras y números mezclados). Guardalo, lo vas a pegar también en Vercel.
4. **Implementar → Nueva implementación** → ícono del engranaje → **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona** (la protección es el TOKEN: sin él, el script rechaza todo)
5. **Implementar** y autorizá los permisos (la misma pantalla de "Google no verificó esta app" de antes: Avanzado → Ir a ...).
6. Copiá la **URL de la aplicación web** (termina en `/exec`).
   Para chequear: pegala en el navegador; tiene que decir "API de presupuesto activa ✅".

> Si ya tenías una implementación hecha: **Implementar → Administrar implementaciones → ✏️** → versión **Nueva versión**, y acceso **Cualquier persona**.
> Cada vez que cambies el código tenés que repetir eso para que la URL tome los cambios.

## Paso 2 — Subir el front a Vercel

1. Creá un repositorio **privado** en GitHub y subí esta carpeta (el `.gitignore` ya evita subir secretos).
2. En https://vercel.com → **Add New → Project** → importá el repositorio.
3. En **Settings → Environment Variables** cargá (ver `.env.example`):

| Variable | Valor |
|---|---|
| `APPS_SCRIPT_URL` | la URL `/exec` del paso 1 |
| `APPS_SCRIPT_TOKEN` | el mismo texto que pusiste en la propiedad `TOKEN` |
| `APP_PASSWORD` | una clave larga para entrar a la app |
| `SESSION_SECRET` | cualquier texto largo al azar |

4. **Deploy** (o **Redeploy** si ya habías desplegado).

## En el celu

Abrí la URL de Vercel, entrá con tu clave y, desde el menú del navegador, elegí **Agregar a pantalla de inicio**.

## Probar en tu compu (opcional)

```bash
cp .env.example .env.local   # completá los valores
npm install
npm run dev                  # http://localhost:3000
```

## Notas

- Los meses se muestran como "Enero 26" … "Diciembre 26" y se ubican buscando el encabezado de cada mes (Enero, ene, ene-26...) en la hoja. Para el año que viene hay que cambiar el "26" en `app/page.js` y en `Code.gs`.
- El menú **💰 Presupuesto** dentro de la planilla sigue funcionando igual (carga con el cuadro de diálogo y también deja fila en el registro).
- La hoja oculta "Registro de gastos (no borrar)" de la versión anterior no se usa más; podés borrarla cuando quieras.
