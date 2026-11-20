#!/usr/bin/env bash
# Uso: scripts/ejecutar.sh <A|B|C|D> <n>
# Copia la plantilla limpia de la configuración y ejecuta Claude Code en modo no interactivo,
# aislado de la configuración personal: solo ajustes del proyecto, sin MCP, sin skills ni
# comandos, sin memoria automática y con las herramientas limitadas a ficheros y npm/node.
set -euo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"
cfg="$1"; n="$2"; id="$cfg-$n"
copia="$R/ejecuciones-nuevas/$id"  # no pisa las ejecuciones publicadas en ejecuciones/
rm -rf "$copia"; mkdir -p "$copia" "$R/resultados-nuevos"
cp -r "$R/plantillas/$cfg/." "$copia/"
cd "$copia"
inicio=$(date -Is)
set +e
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 ENABLE_CLAUDEAI_MCP_SERVERS=false timeout 1800 \
claude -p "$(cat "$R/scripts/tarea.txt")" \
  --model claude-opus-5-5 \
  --effort high \
  --setting-sources project \
  --settings '{"autoMemoryEnabled":false}' \
  --strict-mcp-config \
  --disable-slash-commands \
  --no-session-persistence \
  --tools "Read,Edit,Write,Glob,Grep,Bash" \
  --allowedTools "Read" "Edit" "Write" "Glob" "Grep" "Bash(npm test)" "Bash(npm test *)" "Bash(npm run *)" "Bash(node --test*)" \
    "Bash(ls *)" "Bash(cat *)" "Bash(find *)" "Bash(head *)" "Bash(tail *)" "Bash(wc *)" "Bash(grep *)" "Bash(echo *)" \
  --append-system-prompt "$(cat "$R/scripts/entorno.txt")" \
  --permission-mode dontAsk \
  --max-budget-usd 5 \
  --output-format stream-json --verbose \
  > "$R/resultados-nuevos/$id.jsonl" 2> "$R/resultados-nuevos/$id.err"
rc=$?
set -e
tail -1 "$R/resultados-nuevos/$id.jsonl" > "$R/resultados-nuevos/$id.json"
echo "{\"id\":\"$id\",\"inicio\":\"$inicio\",\"fin\":\"$(date -Is)\",\"rc\":$rc}" > "$R/resultados-nuevos/$id.meta.json"
cd "$R/medicion"
node --disable-warning=ExperimentalWarning medir.mjs "$copia" "$R/plantillas/$cfg" "$R/resultados-nuevos/$id.json" > "$R/resultados-nuevos/$id.medidas.json"
echo "$id terminado (rc=$rc)"
