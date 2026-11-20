#!/usr/bin/env bash
# Uso: scripts/ronda.sh <n> — ejecuta A-n, B-n, C-n y D-n en paralelo.
R="$(cd "$(dirname "$0")/.." && pwd)"
for cfg in A B C D; do "$R/scripts/ejecutar.sh" "$cfg" "$1" & done
wait
