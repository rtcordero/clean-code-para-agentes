// Mide una copia del proyecto igual para todas las configuraciones.
// Uso: node medir.mjs <copia> <plantilla-limpia> [salida-claude.json]
// Imprime un JSON con las métricas.
import { ESLint } from 'eslint';
import * as espree from 'espree';
import { stripTypeScriptTypes } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const [copia, plantilla, salidaClaude] = process.argv.slice(2);
const UMBRAL_FUNCION_LARGA = 20;

function ficheros(dir, ext = '.ts') {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return ficheros(ruta, ext);
    return ruta.endsWith(ext) ? [ruta] : [];
  });
}

function ejecutar(cmd, args, opciones = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 120000, ...opciones });
  return { codigo: r.status, salida: (r.stdout ?? '') + (r.stderr ?? '') };
}

function resumenNodeTest(salida) {
  const num = (clave) => Number((salida.match(new RegExp(`ℹ ${clave} (\\d+)`)) ?? [])[1] ?? NaN);
  return { tests: num('tests'), pasan: num('pass'), fallan: num('fail') };
}

// 1. Tests del propio proyecto.
const tests = ejecutar('node', ['--test'], { cwd: copia });
const testsProyecto = { verde: tests.codigo === 0, ...resumenNodeTest(tests.salida) };

// 2. Tests de aceptación ocultos.
const acept = ejecutar('node', ['--test', join(aqui, 'aceptacion.test.mjs')], {
  cwd: aqui,
  env: { ...process.env, PROYECTO: copia },
});
const aceptacion = resumenNodeTest(acept.salida);

// 3. Tipos.
const tsc = ejecutar(join(copia, 'node_modules/.bin/tsc'), ['--noEmit', '-p', copia]);
const erroresTipos = (tsc.salida.match(/error TS\d+/g) ?? []).length;

// 4. ESLint con la configuración de D, aplicada a todas.
const eslint = new ESLint({ cwd: copia, overrideConfigFile: join(aqui, 'eslint.config.js') });
const resultados = await eslint.lintFiles(['src/**/*.ts']);
const porRegla = {};
let avisos = 0;
for (const r of resultados) {
  for (const m of r.messages) {
    avisos += 1;
    const regla = m.ruleId ?? 'parse-error';
    porRegla[regla] = (porRegla[regla] ?? 0) + 1;
  }
}

// Complejidad máxima: ESLint con complexity a 0 informa del valor de cada función.
const eslintComplejidad = new ESLint({
  cwd: copia,
  overrideConfigFile: join(aqui, 'eslint.config.js'),
  overrideConfig: { files: ['src/**/*.ts'], rules: { complexity: ['error', { max: 0 }] } },
});
let complejidadMaxima = 0;
for (const r of await eslintComplejidad.lintFiles(['src/**/*.ts'])) {
  for (const m of r.messages) {
    const valor = m.ruleId === 'complexity' && m.message.match(/complexity of (\d+)/);
    if (valor) complejidadMaxima = Math.max(complejidadMaxima, Number(valor[1]));
  }
}

// 5. Funciones: la más larga (líneas físicas, de la cabecera al cierre) y cuántas pasan de 20.
const funciones = [];
function recorrer(nodo, fichero) {
  if (!nodo || typeof nodo.type !== 'string') return;
  if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(nodo.type)) {
    funciones.push({ fichero, linea: nodo.loc.start.line, lineas: nodo.loc.end.line - nodo.loc.start.line + 1 });
  }
  for (const valor of Object.values(nodo)) {
    if (Array.isArray(valor)) valor.forEach((hijo) => recorrer(hijo, fichero));
    else if (valor && typeof valor === 'object' && valor.type) recorrer(valor, fichero);
  }
}
const src = ficheros(join(copia, 'src'));
let comentariosConCodigo = 0;
for (const fichero of src) {
  const codigo = readFileSync(fichero, 'utf8');
  try {
    const ast = espree.parse(stripTypeScriptTypes(codigo, { mode: 'strip' }), {
      ecmaVersion: 'latest', sourceType: 'module', loc: true,
    });
    recorrer(ast, relative(copia, fichero));
  } catch {
    funciones.push({ fichero: relative(copia, fichero), linea: 0, lineas: NaN, error: 'no se pudo analizar' });
  }
  // Código comentado (heurística): comentarios de línea que terminan como código.
  comentariosConCodigo += codigo.split('\n').filter((l) => /^\s*\/\/.*([;{}]|\)\s*)$/.test(l)).length;
}
const masLarga = funciones.reduce((a, b) => (b.lineas > (a?.lineas ?? 0) ? b : a), null);

// 6. Regla de capas: el dominio no importa infraestructura, aplicación ni módulos de Node,
// y no lee el reloj del sistema.
const violacionesCapas = [];
const relojEnDominio = [];
for (const fichero of ficheros(join(copia, 'src/dominio'))) {
  const codigo = readFileSync(fichero, 'utf8');
  for (const [, ruta] of codigo.matchAll(/(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]/g)) {
    if (/infraestructura|aplicacion|^node:|^fs$|^path$/.test(ruta)) {
      violacionesCapas.push(`${relative(copia, fichero)} -> ${ruta}`);
    }
  }
  for (const [coincidencia] of codigo.matchAll(/new Date\(\s*\)|Date\.now\(\)/g)) {
    relojEnDominio.push(`${relative(copia, fichero)}: ${coincidencia}`);
  }
}

// 7. Líneas cambiadas frente a la plantilla limpia de su configuración.
function numstat(sub) {
  const r = spawnSync('git', ['diff', '--no-index', '--numstat', join(plantilla, sub), join(copia, sub)], { encoding: 'utf8' });
  let anadidas = 0;
  let borradas = 0;
  let ficherosCambiados = 0;
  for (const linea of (r.stdout ?? '').trim().split('\n').filter(Boolean)) {
    const [a, b] = linea.split('\t');
    anadidas += Number(a) || 0;
    borradas += Number(b) || 0;
    ficherosCambiados += 1;
  }
  return { anadidas, borradas, ficheros: ficherosCambiados };
}
const diff = { src: numstat('src'), test: numstat('test') };
const ficherosNuevosFuera = execFileSync('bash', ['-c',
  `diff -rq --exclude=node_modules --exclude=src --exclude=test "${plantilla}" "${copia}" || true`], { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);

// 8. Datos de la ejecución de Claude Code, si los hay.
let claude = null;
if (salidaClaude && existsSync(salidaClaude)) {
  const j = JSON.parse(readFileSync(salidaClaude, 'utf8'));
  claude = {
    is_error: j.is_error,
    subtype: j.subtype,
    num_turns: j.num_turns,
    duration_ms: j.duration_ms,
    total_cost_usd: j.total_cost_usd,
    input_tokens: j.usage?.input_tokens,
    cache_read_input_tokens: j.usage?.cache_read_input_tokens,
    cache_creation_input_tokens: j.usage?.cache_creation_input_tokens,
    output_tokens: j.usage?.output_tokens,
    modelos: Object.keys(j.modelUsage ?? {}),
    permission_denials: (j.permission_denials ?? []).length,
  };
}

console.log(JSON.stringify({
  copia: relative(join(aqui, '..'), copia),
  testsProyecto,
  aceptacion,
  erroresTipos,
  eslint: { avisos, porRegla },
  numerosMagicos: porRegla['no-magic-numbers'] ?? 0,
  complejidadMaxima,
  funcionMasLarga: masLarga,
  funcionesDeMasDe20Lineas: funciones.filter((f) => f.lineas > UMBRAL_FUNCION_LARGA).length,
  violacionesCapas,
  relojEnDominio,
  comentariosConCodigo,
  diff,
  ficherosNuevosFuera,
  claude,
}, null, 2));
