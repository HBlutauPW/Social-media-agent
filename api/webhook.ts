import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>PW LABs — Social Agent</title>
<style>
body{font-family:monospace;background:#0D1117;color:#E6EDF3;padding:40px 20px}
h1{color:#5DCAA5;margin-bottom:4px;font-size:20px}
.sub{color:#8B949E;font-size:12px;margin-bottom:32px}
label{display:block;font-size:11px;color:#8B949E;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}
select,input,textarea{width:100%;max-width:600px;padding:8px 12px;background:#161B22;border:1px solid #30363D;border-radius:6px;color:#E6EDF3;font-family:monospace;font-size:13px;margin-bottom:16px;display:block}
textarea{min-height:100px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:600px}
.row select{width:100%}
button{background:#1D9E75;border:none;border-radius:6px;padding:10px 24px;color:#0D1117;font-weight:600;font-size:13px;cursor:pointer;margin-bottom:16px}
button:hover{background:#5DCAA5}
pre{background:#161B22;border:1px solid #30363D;border-radius:8px;padding:16px;max-width:600px;white-space:pre-wrap;word-break:break-word;font-size:12px;color:#79C0FF;line-height:1.6}
.hint{font-size:11px;color:#484F58;margin-top:-12px;margin-bottom:16px;max-width:600px}
.loading{color:#E3B341;font-size:12px;margin-bottom:12px;display:none}
.divider{border:none;border-top:1px solid #21262D;max-width:600px;margin:8px 0 16px}
</style>
</head>
<body>
<h1>⚡ PW LABs — Social Agent</h1>
<p class="sub">Gere posts para Instagram e LinkedIn em PT e EN</p>

<div class="row">
  <div>
    <label>Tipo de post</label>
    <select id="t">
      <option value="portfolio">Portfólio e processo</option>
      <option value="ia_news">IA aplicada à archviz</option>
      <option value="mercado">Mercado e colaborações</option>
      <option value="opiniao">Ponto de vista</option>
      <option value="bastidores">Bastidores</option>
    </select>
  </div>
  <div>
    <label>Idioma</label>
    <select id="i">
      <option value="pt+en">PT + EN</option>
      <option value="pt">Somente PT</option>
      <option value="en">Somente EN</option>
    </select>
  </div>
</div>

<label>Link da matéria ou referência (opcional)</label>
<input id="link" type="url" placeholder="https://...">
<p class="hint">Se colado, o agente lê o conteúdo do link e gera o post a partir dele. Sem link, busca automaticamente.</p>

<hr class="divider">

<label>Projeto</label>
<input id="p" placeholder="Nome do projeto">

<label>Parceiro / Cliente</label>
<input id="pa" placeholder="Nome do escritório ou cliente">

<label>Material bruto</label>
<textarea id="m" placeholder="Descreva o que foi feito, o processo, resultados, aprendizados..."></textarea>
<p class="hint">Quanto mais contexto, melhor o post gerado.</p>

<hr class="divider">

<label>Secret</label>
<input id="s" type="password" placeholder="••••••••">
<p class="hint">Sua chave de acesso configurada no Vercel.</p>

<button onclick="go()">⚡ Gerar posts</button>
<div class="loading" id="loading">Gerando posts... aguarde ~20 segundos</div>
<pre id="r" style="display:none"></pre>

<script>
async function go(){
  document.getElementById('loading').style.display='block';
  document.getElementById('r').style.display='none';
  const body={
    tipo:document.getElementById('t').value,
    idioma:document.getElementById('i').value,
    projeto:document.getElementById('p').value,
    parceiro:document.getElementById('pa').value,
    material:document.getElementById('m').value,
    link:document.getElementById('link').value,
  };
  try{
    const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','X-Secret':document.getElementById('s').value},body:JSON.stringify(body)});
    const d=await r.json();
    document.getElementById('loading').style.display='none';
    document.getElementById('r').style.display='block';
    document.getElementById('r').textContent=d.draft||JSON.stringify(d,null,2);
  }catch(e){
    document.getElementById('loading').style.display='none';
    document.getElementById('r').style.display='block';
    document.getElementById('r').textContent='Erro: '+e.message;
  }
}
</script>
</body>
</html>`);
}
