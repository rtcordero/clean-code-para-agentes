# Cuotas del gimnasio

Calcula y cobra la cuota mensual de los socios de un gimnasio.

- `src/dominio/`: reglas de negocio (socios, planes, cuotas).
- `src/aplicacion/`: casos de uso que coordinan dominio e infraestructura.
- `src/infraestructura/`: repositorio de socios y reloj.

## Comandos

- `npm test`: ejecuta los tests con `node --test`.
- `npm run typecheck`: comprueba los tipos con `tsc`.

Node 24 ejecuta TypeScript directamente quitando los tipos (type stripping): no se pueden usar `enum`, `namespace` ni propiedades en el constructor (`constructor(private x)`), y los imports llevan la extensión `.ts`.
