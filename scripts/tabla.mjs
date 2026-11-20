// Agrega resultados/*.medidas.json en una tabla Markdown y medias por configuración.
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', process.argv[2] ?? 'resultados');
const filas = readdirSync(dir)
  .filter((f) => /^[ABCD]-\d+\.medidas\.json$/.test(f))
  .sort()
  .map((f) => ({ id: f.split('.')[0], ...JSON.parse(readFileSync(join(dir, f), 'utf8')) }));

const col = {
  'Tests propios': (m) => `${m.testsProyecto.verde ? 'verde' : 'ROJO'} (${m.testsProyecto.tests})`,
  'Aceptación /16': (m) => m.aceptacion.pasan,
  'Errores tipos': (m) => m.erroresTipos,
  'Avisos ESLint': (m) => m.eslint.avisos,
  'Núm. mágicos': (m) => m.numerosMagicos,
  'Función más larga': (m) => m.funcionMasLarga?.lineas,
  'Funciones >20': (m) => m.funcionesDeMasDe20Lineas,
  'Complejidad máx.': (m) => m.complejidadMaxima,
  'Capas (imports)': (m) => m.violacionesCapas.length,
  'Reloj en dominio': (m) => m.relojEnDominio.length,
  'Código comentado': (m) => m.comentariosConCodigo,
  '+/− src': (m) => `${m.diff.src.anadidas}/${m.diff.src.borradas}`,
  '+/− test': (m) => `${m.diff.test.anadidas}/${m.diff.test.borradas}`,
  Turnos: (m) => m.claude?.num_turns,
  'Duración (s)': (m) => Math.round((m.claude?.duration_ms ?? NaN) / 1000),
  'Coste (USD)': (m) => m.claude?.total_cost_usd?.toFixed(2),
  'Tokens salida': (m) => m.claude?.output_tokens,
};
const cab = ['Ejecución', ...Object.keys(col)];
console.log(`| ${cab.join(' | ')} |`);
console.log(`| ${cab.map(() => '---').join(' | ')} |`);
for (const f of filas) console.log(`| ${f.id} | ${Object.values(col).map((c) => c(f)).join(' | ')} |`);

const num = {
  'Tests propios en verde': (m) => (m.testsProyecto.verde ? 1 : 0),
  'Tests propios (n)': (m) => m.testsProyecto.tests,
  'Aceptación /16': (m) => m.aceptacion.pasan,
  'Errores tipos': (m) => m.erroresTipos,
  'Avisos ESLint': (m) => m.eslint.avisos,
  'Núm. mágicos': (m) => m.numerosMagicos,
  'Función más larga': (m) => m.funcionMasLarga?.lineas,
  'Funciones >20': (m) => m.funcionesDeMasDe20Lineas,
  'Complejidad máx.': (m) => m.complejidadMaxima,
  'Capas (imports)': (m) => m.violacionesCapas.length,
  'Reloj en dominio': (m) => m.relojEnDominio.length,
  'Líneas añadidas src': (m) => m.diff.src.anadidas,
  'Líneas añadidas test': (m) => m.diff.test.anadidas,
  Turnos: (m) => m.claude?.num_turns,
  'Duración (s)': (m) => (m.claude?.duration_ms ?? NaN) / 1000,
  'Coste (USD)': (m) => m.claude?.total_cost_usd,
  'Tokens salida': (m) => m.claude?.output_tokens,
};
console.log('\n| Media | ' + Object.keys(num).join(' | ') + ' |');
console.log('| --- | ' + Object.keys(num).map(() => '---').join(' | ') + ' |');
for (const cfg of ['A', 'B', 'C', 'D']) {
  const g = filas.filter((f) => f.id.startsWith(cfg + '-'));
  if (!g.length) continue;
  const medias = Object.values(num).map((fn) => {
    const v = g.map(fn).filter((x) => typeof x === 'number' && !Number.isNaN(x));
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2).replace(/\.00$/, '') : '—';
  });
  console.log(`| ${cfg} (n=${g.length}) | ${medias.join(' | ')} |`);
}
