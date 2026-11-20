# Reglas de código

Cada regla se puede comprobar. El motivo va detrás.

1. **Nombres que dicen qué es**, en español y con el vocabulario del negocio (`descuentoPorAntiguedad`, no `d`, `tmp` ni `calc`). El código se lee muchas más veces de las que se escribe.
2. **Funciones de 20 líneas como máximo**, sin contar las líneas en blanco. Una función corta cabe en la cabeza y en una revisión.
3. **Como mucho 5 caminos por función y 2 niveles de anidación.** Usa retornos tempranos. Cada `if` más es un caso más que probar.
4. **Como mucho 3 parámetros.** Si necesitas más, agrúpalos en un objeto con nombre. Las listas largas de argumentos se confunden de orden.
5. **Sin números mágicos.** Cada tarifa, porcentaje, edad, umbral o mes va en una constante con nombre (se permiten 0, 1 y -1). Así una regla de negocio se cambia en un solo sitio y se entiende sin adivinar.
6. **Sin código comentado ni TODO.** Lo que no se usa se borra; el control de versiones ya lo recuerda.
7. **El dominio no depende de nada de fuera.** `src/dominio/` no importa de `src/infraestructura/`, de `src/aplicacion/` ni módulos de Node, y no lee el reloj del sistema (`new Date()` sin argumentos o `Date.now()`): recibe la fecha como parámetro. Así las reglas de negocio se prueban sin montar infraestructura.
8. **Lo que el dominio necesita de fuera se lo da la aplicación.** Si una regla necesita un dato del repositorio o del reloj, el caso de uso de `src/aplicacion/` lo obtiene y se lo pasa al dominio como dato. El dominio no conoce el repositorio.
9. **Una regla de negocio, una función con nombre.** No mezcles varias reglas en la misma función: cuando cambie una, solo se toca una.
10. **Dinero en céntimos enteros y un solo redondeo, al final.** Los decimales en coma flotante acumulan errores.
11. **Cada regla nueva tiene sus tests, incluidos los límites** (el día exacto, el tope, el caso que no aplica). Un test que no falla sin la regla no la protege.
12. **Los tests del dominio prueban funciones puras con datos**, sin repositorio ni reloj. Son más rápidos y fallan por una sola razón.
13. **No cambies firmas públicas que la tarea no pide cambiar ni añadas dependencias.** Otros equipos dependen de ellas.
14. **Antes de dar la tarea por terminada, `npm test` y `npm run typecheck` pasan sin errores.**

## Sensores

Estas reglas se comprueban solas:

- `npm run lint` (ESLint, `eslint.config.js`) comprueba las reglas 1 a 5: longitud de funciones, complejidad, anidación, parámetros, números mágicos y nombres de una letra.
- `test/arquitectura.test.ts` comprueba la regla 7: falla si el dominio importa infraestructura, aplicación o módulos de Node, o lee el reloj del sistema.

Antes de terminar, `npm test`, `npm run typecheck` y `npm run lint` deben pasar sin errores. Si un sensor falla, arregla el código: no desactives reglas ni cambies `eslint.config.js`, `herramientas/` o el test de arquitectura para que pasen.
