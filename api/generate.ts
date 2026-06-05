import Anthropic from "@anthropic-ai/sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPTS: Record<string, string> = {
  portfolio: "Crie posts sobre portfólio de archviz e processo criativo. Mostre resultado real, mencione ferramentas usadas e cliente/parceiro quando possível.",
  ia_news: "Crie posts sobre IA aplicada à archviz. Perspectiva prática de quem usa no workflow real — Runway, Veo, Sora, Midjourney. Não reposte notícia sem opinião própria.",
  mercado: "Crie posts sobre mercado arquitetônico e colaborações. Associe o nome do autor a projetos e instituições relevantes como Perkins & Will.",
  opiniao: "Crie posts com ponto de vista pessoal sobre o futuro da profissão, IA e arquitetura. Opinioso mas não arrogante, abre para debate.",
  bastidores: "Crie posts de bastidores e processo. Tom casual e humano, mostra o lado real do trabalho.",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = req.headers["x-secret"];
  if (secret !== process.env.AGENT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    tipo = "ia_news",
    idioma = "pt+en",
    material = "",
    projeto = "",
    parceiro = "",
    link = "",
  } = req.body || {};

  // Se tiver link, busca e extrai o conteúdo
  let conteudoLink = "";
  if (link) {
    try {
      const response = await fetch(link, {
        headers: { "User-Agent": "SocialMediaAgent/1.0" },
      });
      const text = await response.text();
      conteudoLink = text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 3000);
    } catch {
      conteudoLink = "";
    }
  }

  const promptBase = PROMPTS[tipo] || PROMPTS.ia_news;

  const systemPrompt = `Você é o agente de social media de Henrique, arquiteto e diretor criativo de archviz na Perkins & Will em São Paulo. Ele lidera o PW LABs e usa IA generativa no workflow real: Runway Gen-4.5, Veo 3, Sora, Midjourney.

Tom: técnico mas acessível, opinionado, sem euforia.
LinkedIn: texto corrido, profissional, até 1.200 caracteres, máx 3 hashtags.
Instagram: legenda impactante na primeira linha, até 300 chars, máx 8 hashtags.`;

  const userPrompt = `${promptBase}

TIPO: ${tipo}
IDIOMA: ${idioma}
${projeto ? `PROJETO: ${projeto}` : ""}
${parceiro ? `PARCEIRO: ${parceiro}` : ""}
${material ? `MATERIAL BRUTO:\n${material}` : ""}
${conteudoLink ? `CONTEÚDO DO LINK (use como base para o post):\n${conteudoLink}` : ""}
${!material && !conteudoLink ? "Sem material fornecido — crie um post relevante baseado no tipo e contexto do autor." : ""}

Gere exatamente neste formato:

## INSTAGRAM PT
(legenda + hashtags)

---

## INSTAGRAM EN
(caption + hashtags)

---

## LINKEDIN PT
(texto completo)

---

## LINKEDIN EN
(full text)

---

## VISUAL
(descrição do visual ideal ou prompt para Gemini Imagen)`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    const date = new Date().toISOString().split("T")[0];

    const draft = `---
tipo: ${tipo}
idioma: ${idioma}
data: ${new Date().toISOString()}
status: draft
projeto: "${projeto}"
parceiro: "${parceiro}"
link: "${link}"
---

${content}`;

    return res.status(200).json({
      ok: true,
      draft,
      filename: `content/drafts/${date}-${tipo}.md`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro desconhecido" });
  }
}
