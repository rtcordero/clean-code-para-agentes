// Vuelve a medir el código que dejó cada ejecución y comprueba que coincide
// con resultados/<id>.medidas.json: tests de aceptación ocultos y avisos de
// ESLint. Así la tabla del README se puede repetir sin volver a llamar al agente.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ESLint } from 'eslint';

const aqui = import.meta.dirname;
const raiz = join(aqui, '..');
const ejecuciones = readdirSync(join(raiz, 'ejecuciones')).sort();
let fallos = 0;

for (const id of ejecuciones) {
  const copia = join(raiz, 'ejecuciones', id);
  const esperado = JSON.parse(
    readFileSync(join(raiz, 'resultados', `${id}.medidas.json`), 'utf8'),
  );

  const aceptacion = spawnSync(
    'node',
    ['--test', join(aqui, 'aceptacion.test.mjs')],
    { env: { ...process.env, PROYECTO: copia }, encoding: 'utf8' },
  );
  const pasan = Number(/(?:#|ℹ) pass (\d+)/.exec(aceptacion.stdout)?.[1] ?? 0);

  const eslint = new ESLint({
    cwd: copia,
    overrideConfigFile: join(aqui, 'eslint.config.js'),
  });
  const informes = await eslint.lintFiles(['src/**/*.ts']);
  const avisos = informes.reduce((total, f) => total + f.messages.length, 0);

  const bien =
    pasan === esperado.aceptacion.pasan &&
    avisos === esperado.eslint.avisos;
  if (!bien) fallos += 1;
  console.log(
    `${bien ? 'ok  ' : 'MAL '} ${id}: aceptación ${pasan}/16, ` +
      `ESLint ${avisos} (esperado ${esperado.aceptacion.pasan}/16, ` +
      `${esperado.eslint.avisos})`,
  );
}

process.exitCode = fallos === 0 ? 0 : 1;
