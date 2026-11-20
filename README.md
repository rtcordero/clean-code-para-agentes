# Clean code para agentes de IA: el experimento

La misma tarea, dada a Claude Code en cuatro versiones del mismo proyecto, para medir qué cambia cuando las reglas de código limpio están escritas y comprobadas. Es el experimento del artículo [Clean code para agentes de IA: reglas que se cumplen](https://rubentejera.com/clean-code-para-agentes-de-ia/).

*English summary below.*

## Qué hay aquí

| Carpeta | Qué contiene |
| --- | --- |
| `base/` | El proyecto de partida: las cuotas de un gimnasio inventado, en TypeScript con Node 24 y `node --test`, con dominio, aplicación e infraestructura |
| `configuraciones/` | Lo que se añade a la base en cada configuración: A (nada), B («Escribe código limpio»), C (14 reglas comprobables en `AGENTS.md`) y D (C más ESLint y un test de arquitectura) |
| `scripts/` | La tarea (`tarea.txt`), la nota de entorno y los guiones para preparar y lanzar cada ejecución |
| `medicion/` | Cómo se midió cada ejecución: 16 tests de aceptación que el agente no veía, la configuración de ESLint y el guion de medición |
| `ejecuciones/` | El código que dejó el agente en cada una de las 12 ejecuciones |
| `resultados/` | Las medidas de cada ejecución y la tabla completa (`tabla.md`) |
| `revisor/` | Un subagente revisor de solo lectura y una skill de revisión de código limpio, de ejemplo. No se ejecutaron en esta ronda |

## Resultados

Tres ejecuciones por configuración, con Claude Code 2.1.326 y Claude Opus 5.5 (`claude-opus-5-5`, esfuerzo alto), el 20 de noviembre de 2026. Medias:

| | A | B | C | D |
| --- | --- | --- | --- | --- |
| Tests de aceptación (de 16) | 16 | 16 | 16 | 16 |
| Avisos de ESLint | 5,3 | 9,3 | 1 | 0 |
| Tests escritos por el agente | 25,7 | 22,3 | 40,7 | 38,3 |
| Violaciones de capas | 0 | 0 | 0 | 0 |
| Coste por ejecución (USD) | 0,41 | 0,41 | 0,51 | 0,56 |

- Las doce resolvieron bien la tarea y ninguna rompió la regla de capas.
- «Escribe código limpio» (B) no mejoró nada frente a no decir nada (A).
- Las reglas concretas (C) dejaron cero números mágicos de negocio y el doble de tests, y conservaron la firma pública que A y B cambiaron.
- Los sensores (D) no tuvieron que corregir nada: el agente pasó el linter a la primera.

Es una muestra pequeña: una tarea, un modelo y tres ejecuciones por configuración. El análisis completo está en el artículo.

## Comprobar los resultados sin volver a llamar al agente

```bash
cd medicion
npm install
NODE_OPTIONS=--disable-warning=ExperimentalWarning node comprobar-resultados.mjs
```

Vuelve a pasar los tests de aceptación y ESLint sobre el código de cada ejecución y lo compara con `resultados/`. Es lo que hace la CI.

## Repetir el experimento

Necesitas Node 24 y Claude Code con sesión iniciada. Cada ejecución cuesta unos 0,40–0,60 USD.

```bash
scripts/preparar.sh   # crea plantillas/A..D con sus dependencias
scripts/ronda.sh 4    # lanza A-4, B-4, C-4 y D-4 en paralelo
node scripts/tabla.mjs
```

`scripts/ejecutar.sh` guarda el código en `ejecuciones/<id>` y las medidas en `resultados/<id>.medidas.json`. El comando exacto de Claude Code, con el aislamiento de la configuración personal y las herramientas permitidas, está en ese guion.

## English summary

An experiment on how to turn clean code principles into rules that a coding agent can follow and that something can check. The same task was given to Claude Code (2.1.326, Claude Opus 5.5) three times in each of four setups: no instructions, a one-line "write clean code" `AGENTS.md`, an `AGENTS.md` with 14 concrete, checkable rules, and the same rules plus ESLint and an architecture test. All 12 runs solved the task. The vague rule did not help; the concrete rules removed business magic numbers, doubled the tests and preserved the public API; the sensors never had to correct anything. Small sample: one task, one model, three runs per setup. `medicion/comprobar-resultados.mjs` reproduces the measurements without calling the agent again. The write-up, in Spanish, is at [rubentejera.com](https://rubentejera.com/clean-code-para-agentes-de-ia/).

## Licencia

MIT.
