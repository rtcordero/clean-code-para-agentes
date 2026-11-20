# Cuotas del gimnasio

Calcula y cobra la cuota mensual de los socios de un gimnasio.

- `src/dominio/`: reglas de negocio (socios, planes, cuotas).
- `src/aplicacion/`: casos de uso que coordinan dominio e infraestructura.
- `src/infraestructura/`: repositorio de socios y reloj.

## Comandos

- `npm test`: ejecuta los tests con `node --test`.
- `npm run typecheck`: comprueba los tipos con `tsc`.

Node 24 ejecuta TypeScript directamente quitando los tipos (type stripping): no se pueden usar `enum`, `namespace` ni propiedades en el constructor (`constructor(private x)`), y los imports llevan la extensión `.ts`.

## Simplificaciones conocidas

- **Dependencias:** el caso de uso `cobrarCuota` importa el repositorio en memoria y la interfaz `Reloj`, que viven en `src/infraestructura/`. En una arquitectura limpia, esas interfaces (los puertos) vivirían en `src/aplicacion/` y la infraestructura las implementaría. Se dejó así a propósito: el experimento no pedía cambiarlo y cambiar la base invalidaría las ejecuciones publicadas.
- **Zona horaria:** la fecha del cobro se toma en UTC (`toISOString()`), así que un cobro a las 00:30 del 1 de septiembre en España contaría como agosto. Los tests usan las 12:00 UTC.
