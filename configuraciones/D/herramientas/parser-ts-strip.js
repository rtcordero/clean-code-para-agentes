// Parser mínimo para que ESLint lea TypeScript sin typescript-eslint:
// Node 24 quita los tipos (los sustituye por espacios, así que líneas y
// columnas se conservan) y espree analiza el JavaScript resultante.
import { stripTypeScriptTypes } from 'node:module';
import * as espree from 'espree';

export function parseForESLint(codigo) {
  const javascript = stripTypeScriptTypes(codigo, { mode: 'strip' });
  const ast = espree.parse(javascript, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    range: true,
    loc: true,
    comment: true,
    tokens: true,
  });
  return { ast };
}
