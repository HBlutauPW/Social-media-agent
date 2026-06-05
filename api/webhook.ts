// ============================================================
// api/webhook.ts — Endpoint para inputs manuais (via formulário ou curl)
// Use este endpoint quando tiver um projeto novo para postar
// ============================================================

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") {
    // Interface HTML simples para enviar input manual
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Agent — Input Manual</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Mono', monospace; background: #0D1117; color: #E6EDF3; padding: 40px 20px; }
    h1 { font-size: 18px; color: #5DCAA5; margin-bottom: 8px; }
    p { font-size: 12px; color: #8B949E; margin-bottom: 32px; }
    label { font-size: 11px; color: #8B949E; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .05em; }
    select, input, textarea {
      width: 100%; padding: 10px 12px; background: #161B22; border: 1px solid #30363D;
      border-radius: 6px; color: #E6EDF3; font-family: 'IBM Plex Mono', monospace;
      font-size: 13px; margin-bottom: 20px;
    }
    textarea { min-height: 120px; resize: vertical; }
    button {
      background: #1D9E75; border: none; border-radius: 6px; padding: 10px 24px;
      color: #0D1117; font-weight: 600; font-size: 13px; cursor: pointer;
      font-family: 'IBM Plex Mono', monospace;
    }
    button:hover { background: #5DCAA5; }
    .form { max-width: 600px; margin: 0 auto; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    #result { margin-top: 24px; background: #161B22; border: 1px solid #30363D; border-radius: 8px; padding: 16px; display: none; }
    #result pre { font-size: 11px; color: #79C0FF; white-space: pre-wrap; word-break: break-word; }
    .loading { color: #E3B341; font-size: 12px; margin-top: 12px; display: none; }
  </style>
</head>
<body>
<div class="form">
  <h1>⚡ Social Agent — Input Manual</h1>
  <p>Preencha o material bruto e gere os posts para revisão.</p>

  <div class="row">
    <div>
      <label>Tipo de post</label>
      <select id="tipo">
        <option value="portfolio">Portfólio e processo</option>
        <option value="ia_news">IA aplicada à archviz</option>
        <option value="mercado">Mercado e colaborações</option>
        <option value="opiniao">Ponto de vista pessoal</option>
        <option value="bastidores">Bastidores</option>
      </select>
    </div>
    <div>
      <label>Idioma</label>
      <select id="idioma">
        <option value="pt+en">PT + EN</option>
        <option value="pt">Somente PT</option>
        <option value="en">Somente EN</option>
      </select>
    </div>
  </div>

  <div class="row">
    <div>
      <label>Tom</label>
      <select id="tom">
        <option value="profissional e direto">Profissional</option>
        <option value="inspirador">Inspirador</option>
        <option value="analítico">Analítico</option>
        <option value="casual">Casual</option>
      </select>
    </div>
    <div>
      <label>CTA</label>
      <select id="cta">
        <option value="pergunta aberta que gere comentário">Pergunta aberta</option>
        <option value="salve este post">Salve</option>
        <option value="siga para mais conteúdo">Siga</option>
        <option value="sem_cta">Sem CTA</option>
      </select>
    </div>
  </div>

  <label>Projeto (opcional)</label>
  <input type="text" id="projeto" placeholder="Ex: Pueri Domus Tatuapé, Residência Vila Nova...">

  <label>Parceiro/Cliente (opcional)</label>
  <input type="text" id="parceiro" placeholder="Ex: Perkins & Will, nome do escritório...">

  <label>Material bruto *</label>
  <textarea id="material" placeholder="Descreva o projeto, o que foi feito, o que você quer comunicar, resultados interessantes, curiosidades do processo..."></textarea>

  <label>Secret (necessário)</label>
  <input type="password" id="secret" placeholder="Seu AGENT_SECRET configurado no Vercel">

  <button onclick="generate()">Gerar posts</button>
  <div class="loading" id="loading">Gerando posts... aguarde ~20s</div>

  <div id="result">
    <pre id="resultContent"></pre>
  </div>
</div>

<script>
async function generate() {
  const secret = document.getElementById('secret').value;
  const body = {
    tipo: document.getElementById('tipo').value,
    idioma: document.getElementById('idioma').value,
    tom: document.getElementById('tom').value,
    cta: document.getElementById('cta').value,
    material: document.getElementById('material').value,
    projeto: document.getElementById('projeto').value,
    parceiro: document.getElementById('parceiro').value,
  };

  document.getElementById('loading').style.display = 'block';
  document.getElementById('result').style.display = 'none';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Secret': secret },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('resultContent').textContent = data.draft || JSON.stringify(data, null, 2);
  } catch (e) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('resultContent').textContent = 'Erro: ' + e.message;
    document.getElementById('result').style.display = 'block';
  }
}
</script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }

  return new Response("Use GET para acessar o formulário", { status: 405 });
}
