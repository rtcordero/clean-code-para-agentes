#!/usr/bin/env bash
# Crea plantillas/<A|B|C|D>: el proyecto base más los ficheros de cada
# configuración, con sus dependencias instaladas. Hazlo una vez antes de
# scripts/ejecutar.sh.
set -euo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"
rm -rf "$R/plantillas"
for cfg in A B C D; do
  dest="$R/plantillas/$cfg"
  mkdir -p "$dest"
  (cd "$R/base" && tar --exclude=node_modules -cf - .) | (cd "$dest" && tar -xf -)
  (cd "$R/configuraciones/$cfg" && tar --exclude=.gitkeep -cf - .) | (cd "$dest" && tar -xf -)
  (cd "$dest" && npm install --no-audit --no-fund)
done
(cd "$R/medicion" && npm install --no-audit --no-fund)
echo "Plantillas en $R/plantillas"
