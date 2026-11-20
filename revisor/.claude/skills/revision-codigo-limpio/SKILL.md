---
name: revision-codigo-limpio
description: Revisa código TypeScript contra las reglas de código limpio de AGENTS.md y pasa los sensores del proyecto. Úsala al terminar una tarea o cuando pidan revisar código limpio.
---

# Revisión de código limpio

1. Ejecuta `npm test`, `npm run typecheck` y `npm run lint`, y anota qué falla.
2. Lee `AGENTS.md`. Revisa los ficheros de `src/` y `test/` regla por regla, sobre todo las que ningún sensor comprueba: nombres (1), una regla por función (9), dinero en céntimos y un solo redondeo (10), tests de los límites (11), tests del dominio sin infraestructura (12) y firmas públicas (13).
3. No modifiques ficheros: devuelve una lista con regla, fichero:línea, problema y arreglo propuesto.
4. Termina con `HALLAZGOS: <n>` (incumplimientos de reglas) y `SUGERENCIAS: <n>`.
