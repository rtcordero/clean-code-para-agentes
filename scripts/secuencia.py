# Secuencia de herramientas de una ejecución, con el resultado resumido de cada Bash.
import json, sys
for ruta in sys.argv[1:]:
    print('==', ruta.split('/')[-1])
    pend = {}
    for linea in open(ruta):
        d = json.loads(linea)
        msg = d.get('message') if isinstance(d.get('message'), dict) else {}
        contenido = msg.get('content') if isinstance(msg.get('content'), list) else []
        for b in contenido:
            if b.get('type') == 'tool_use':
                i = b['input']
                desc = i.get('command') or i.get('file_path', '').split('/ejecuciones/')[-1] or i.get('pattern', '')
                print(f"  {b['name']}: {str(desc)[:90]}")
                pend[b['id']] = b['name']
            elif b.get('type') == 'tool_result' and pend.get(b['tool_use_id']) == 'Bash':
                c = b.get('content')
                texto = c if isinstance(c, str) else ' '.join(x.get('text', '') for x in c)
                lineas = [l for l in texto.splitlines() if any(k in l for k in ('problem', 'error', 'ℹ pass', 'ℹ fail', 'not ok', 'denied', 'permission'))]
                print('     ->', ' | '.join(lineas[:6])[:300])
