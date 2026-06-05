import json
import os
import sys
from datetime import date

with open('draft.json') as f:
    data = json.load(f)

draft = data.get('draft', '')

if not draft:
    print("Erro: draft vazio")
    print("Resposta recebida:", data)
    sys.exit(1)

tipo = os.environ.get('TIPO', 'post')
today = date.today().isoformat()
filename = f'content/drafts/{today}-{tipo}.md'

os.makedirs('content/drafts', exist_ok=True)

with open(filename, 'w') as f:
    f.write(draft)

print(f'Draft salvo em {filename}')
