import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Social Agent</title>
<style>
body{font-family:monospace;background:#0D1117;color:#E6EDF3;padding:40px 20px}
h1{color:#5DCAA5;margin-bottom:24px}
label{display:block;font-size:11px;color:#8B949E;margin-bottom:4px;text-transform:uppercase}
select,input,textarea{width:100%;max-width:600px;padding:8px 12px;background:#161B22;border:1px solid #30363D;border-radius:6px;color:#E6EDF3;font-family:monospace;font-size:13px;margin-bottom:16px;display:block}
textarea{min-height:100px}
button{background:#1D9E75;border:none;border-radius:6px;padding:10px 24px;color:#0D1117;font-weight:600;font-size:13px;cursor:pointer;margin-bottom:16px}
pre{background:#161B22;border:1px solid #30363D;border-radius:8px;padding:16px;max-width:600px;white-space:pre-wrap;word-break:break-word;font-size:12px;color:#79C0FF}
</style>
</head>
<body>
<h1>Social Agent</h1>
<label>Tipo</label>
<select id="t"><option value="portfolio">Portfolio</option><option value="ia_news">IA News</option><option value="mercado">Mercado</option><option value="opiniao">Opiniao</option></select>
<label>Idioma</label>
<select id="i"><option value="pt+en">PT+EN</option><option value="pt">PT</option><option value="en">EN</option></select>
<label>Projeto</label>
<input id="p" placeholder="Ex: Pueri Domus">
<label>Parceiro</label>
<input id="pa" placeholder="Ex: Perkins e Will">
<label>Material</label>
<textarea id="m" placeholder="Descreva o projeto..."></textarea>
<label>Secret</label>
<input id="s" type="password">
<br>
<button onclick="go()">Gerar posts</button>
<pre id="r">Resultado aparece aqui...</pre>
<script>
async function go(){
  document.getElementById('r').textContent='Gerando... aguarde 20s';
  const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','X-Secret':document.getElementById('s').value},body:JSON.stringify({tipo:document.getElementById('t').value,idioma:document.getElementById('i').value,projeto:document.getElementById('p').value,parceiro:document.getElementById('pa').value,material:document.getElementById('m').value})});
  const d=await r.json();
  document.getElementById('r').textContent=d.draft||JSON.stringify(d,null,2);
}
</script>
</body>
</html>`);
}
