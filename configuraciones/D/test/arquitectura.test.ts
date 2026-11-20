import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DOMINIO = join(import.meta.dirname, '..', 'src', 'dominio');
const IMPORT_PROHIBIDO = /infraestructura|aplicacion|^node:/;
const RELOJ_DEL_SISTEMA = /new Date\(\s*\)|Date\.now\(\)/;

function ficherosTs(directorio: string): string[] {
  return readdirSync(directorio).flatMap((nombre) => {
    const ruta = join(directorio, nombre);
    if (statSync(ruta).isDirectory()) {
      return ficherosTs(ruta);
    }
    return ruta.endsWith('.ts') ? [ruta] : [];
  });
}

function importsDe(codigo: string): string[] {
  return [...codigo.matchAll(/(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

test('el dominio no importa infraestructura, aplicación ni módulos de Node', () => {
  const violaciones = ficherosTs(DOMINIO).flatMap((fichero) =>
    importsDe(readFileSync(fichero, 'utf8'))
      .filter((ruta) => IMPORT_PROHIBIDO.test(ruta))
      .map((ruta) => `${fichero} importa ${ruta}`),
  );
  assert.deepEqual(violaciones, []);
});

test('el dominio no lee el reloj del sistema', () => {
  const violaciones = ficherosTs(DOMINIO).filter((fichero) => RELOJ_DEL_SISTEMA.test(readFileSync(fichero, 'utf8')));
  assert.deepEqual(violaciones, []);
});
