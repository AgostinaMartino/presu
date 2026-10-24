'use client';

import { useEffect, useState } from 'react';

const ICONOS = [
  [/alquiler|cochera/i, '🏠'],
  [/expensas|luz|agua|gas|internet|celular|celu/i, '💡'],
  [/monotributo|rentas|impuesto/i, '🧾'],
  [/global shapers|club/i, '🌍'],
  [/inglés|italiano|idioma/i, '🗣️'],
  [/yoga|danza|gym|teatro/i, '🧘'],
  [/movilidad|auto|nafta|colectivo|taxi/i, '🚗'],
  [/alimentaci[oó]n|comida/i, '🍎'],
  [/salidas|entretenimiento/i, '🎉'],
  [/regalos/i, '🎁'],
  [/salud|psic[oó]loga|osde|prevenci[oó]n/i, '💊'],
  [/belleza|depilaci[oó]n/i, '💅'],
  [/viajes/i, '✈️'],
  [/mba|becas|estudio/i, '🎓'],
  [/extras|otr[oe]s/i, '🧩']
];

function iconoPara(nombre) {
  for (const [regex, icono] of ICONOS) if (regex.test(nombre)) return icono;
  return '•';
}

function etiquetaMesActual() {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${meses[new Date().getMonth()]} 26`;
}

const SECCIONES = [
  ['Fijo', '📌 Gastos fijos'],
  ['Variable', '🔄 Gastos variables'],
  ['Otras', '📋 Otras filas de la columna A']
];

const pesos = (n) => '$' + Number(n).toLocaleString('es-AR');

function Cabecera({ conFecha }) {
  const fecha = conFecha
    ? new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  return (
    <div className="cabecera">
      <div className="icono">💸</div>
      <div>
        <h1>Mi presupuesto</h1>
        {conFecha && <p className="fecha">{fecha}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const [vista, setVista] = useState('cargando'); // cargando | login | listo
  const [estructura, setEstructura] = useState(null);
  const [clave, setClave] = useState('');
  const [fila, setFila] = useState('');
  const [col, setCol] = useState('');
  const [importe, setImporte] = useState('');
  const [estimado, setEstimado] = useState('');
  const [detalle, setDetalle] = useState('');
  const [msg, setMsg] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [recientes, setRecientes] = useState([]);

  async function cargarEstructura() {
    try {
      const res = await fetch('/api/estructura');
      if (res.status === 401) { setVista('login'); return; }
      const data = await res.json();
      if (!res.ok) {
        setMsg({ tipo: 'error', texto: data.error || 'No pude leer la planilla.' });
        setVista('listo');
        return;
      }
      setEstructura(data);
      if (data.categorias.length) setFila(String(data.categorias[0].fila));
      if (data.meses.length) {
        const actual = data.meses.find((m) => m.mes === etiquetaMesActual());
        setCol(String((actual || data.meses[0]).col));
      }
      if (data.avisoMeses) setMsg({ tipo: 'error', texto: data.avisoMeses });
      setVista('listo');
    } catch (e) {
      setMsg({ tipo: 'error', texto: 'No pude conectarme. Probá de nuevo.' });
      setVista('listo');
    }
  }

  useEffect(() => { cargarEstructura(); }, []);

  async function entrar(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: clave })
    });
    const data = await res.json();
    if (!res.ok) { setMsg({ tipo: 'error', texto: data.error }); return; }
    setClave('');
    setVista('cargando');
    cargarEstructura();
  }

  async function cargar(e) {
    e.preventDefault();
    if (fila === '' || col === '') { setMsg({ tipo: 'error', texto: '⚠️ Elegí categoría y mes.' }); return; }
    if (!importe || Number(importe) <= 0) { setMsg({ tipo: 'error', texto: '⚠️ Ingresá un importe válido.' }); return; }

    const mesLabel = estructura.meses.find((m) => String(m.col) === col)?.mes || '';
    setEnviando(true);
    setMsg({ tipo: 'espera', texto: 'Cargando... ⏳' });
    try {
      const res = await fetch('/api/gasto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila: Number(fila), col: Number(col), importe, estimado, detalle, mesLabel })
      });
      if (res.status === 401) { setVista('login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar.');

      setMsg({ tipo: 'ok', texto: `✅ ${data.mensaje} Total del mes en esa categoría: ${pesos(data.nuevoTotal)}` });
      setRecientes((r) => [
        {
          id: Date.now(),
          categoria: data.categoria,
          mes: mesLabel,
          detalle,
          importe: Number(importe),
          hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        },
        ...r
      ].slice(0, 6));
      setImporte(''); setEstimado(''); setDetalle('');
    } catch (err) {
      setMsg({ tipo: 'error', texto: `⚠️ ${err.message}` });
    } finally {
      setEnviando(false);
    }
  }

  if (vista === 'cargando') {
    return (
      <main>
        <Cabecera />
        <div className="tarjeta"><p className="suave">Leyendo tu planilla... ⏳</p></div>
      </main>
    );
  }

  if (vista === 'login') {
    return (
      <main>
        <Cabecera />
        <form className="tarjeta" onSubmit={entrar}>
          <label htmlFor="clave">🔑 Clave</label>
          <input id="clave" type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoFocus />
          <button type="submit">Entrar</button>
          {msg && <div className={`aviso ${msg.tipo}`}>{msg.texto}</div>}
        </form>
      </main>
    );
  }

  return (
    <main>
      <Cabecera conFecha />
      <form className="tarjeta" onSubmit={cargar}>
        <label htmlFor="categoria">🏷️ Categoría</label>
        <select id="categoria" value={fila} onChange={(e) => setFila(e.target.value)}>
          {estructura && estructura.categorias.length === 0 && (
            <option value="">No encontré categorías en la columna A</option>
          )}
          {estructura && SECCIONES.map(([clave, titulo]) => {
            const items = estructura.categorias.filter((c) => c.seccion === clave);
            if (!items.length) return null;
            return (
              <optgroup key={clave} label={titulo}>
                {items.map((c) => (
                  <option key={c.fila} value={c.fila}>{iconoPara(c.nombre)}  {c.nombre}</option>
                ))}
              </optgroup>
            );
          })}
        </select>

        <label htmlFor="mes">📅 Mes</label>
        <select id="mes" value={col} onChange={(e) => setCol(e.target.value)}>
          {estructura && estructura.meses.length === 0 && <option value="">No detecté los meses</option>}
          {estructura && estructura.meses.map((m) => (
            <option key={m.col} value={m.col}>{m.mes}</option>
          ))}
        </select>

        <label htmlFor="importe">💰 Importe</label>
        <div className="monto">
          <span>$</span>
          <input id="importe" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0"
                 value={importe} onChange={(e) => setImporte(e.target.value)} />
        </div>

        <label htmlFor="detalle">📝 Detalle <span className="opcional">(opcional)</span></label>
        <input id="detalle" type="text" placeholder="Ej: súper, regalo de cumple..."
               value={detalle} onChange={(e) => setDetalle(e.target.value)} />

        <label htmlFor="estimado">🎯 Estimado <span className="opcional">(opcional)</span></label>
        <input id="estimado" type="number" min="0" step="0.01" inputMode="decimal"
               placeholder="Dejalo vacío si no cambia"
               value={estimado} onChange={(e) => setEstimado(e.target.value)} />

        <button type="submit" disabled={enviando}>✨ Cargar gasto</button>
        {msg && <div className={`aviso ${msg.tipo}`}>{msg.texto}</div>}
      </form>

      {recientes.length > 0 && (
        <section className="recientes">
          <h2>🧾 Cargados en esta sesión</h2>
          <ul>
            {recientes.map((r) => (
              <li key={r.id}>
                <span className="ico">{iconoPara(r.categoria)}</span>
                <div className="info">
                  <div className="cat">{r.categoria}</div>
                  <div className="sub">{r.mes} · {r.hora}{r.detalle ? ` · ${r.detalle}` : ''}</div>
                </div>
                <div className="imp">{pesos(r.importe)}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
