import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Agent — Input Manual</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace; background: #0D1117; color: #E6EDF3; padding: 40px 20px; }
    h1 { font-size: 18px; color: #5DCAA5; margin-bottom: 8px; }
    p { font-size: 12px; color: #8B949E; margin-bottom: 32px; }
    label { font-size: 11px; color: #8B949E; display: block; margin-bottom: 6px; text-transform: uppercase; }
    select, input, textarea {
      width: 100%; padding: 10px 12px; background: #161B22; border: 1px solid #30363D;
      border-radius: 6px; color: #E6EDF3; font-family: monospace;
      font-size: 13px; margin-bottom: 20px;
    }
    textarea { min-height: 120px; resize: vertical; }
    button {
      background: #1D9E75; border: none; border-radius: 6px; padding: 10px 24px;
      color: #0D1117; font-weight: 600; font-size: 13px; cursor: pointer;
    }
    .form { max-width: 600px; margin: 0 auto; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    #result { margin-top: 24px; background: #161B22; border: 1px solid #30363D; border-radius: 8px; padding: 16px; display: none; white-space: pre-wrap; font-size: 12px; color: #79C0FF; }
    #loading { color: #E3B341; font-size: 12px; margin-top: 12px; display: none; }
  </style>
</head>
<body>
<div class="form">
  <h1>⚡ Social Agent</h1>
  <p>Preencha o material e gere os posts para revisão.</p>

  <div class="row">
    <div>
      <label>Tipo</label>
      <select id="tipo">
        <option value="portfolio">Portfólio</option>
        <option value="ia_news">IA News</option>
        <option value="mercado">Mercado</option>
        <option value="opiniao">Opinião</option>
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

  <label>Projeto (opcional)</label>
  <input type="text" id="projeto" pla
