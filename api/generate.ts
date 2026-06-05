import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPTS: Record<string, string> = {
  portfolio: "Crie posts sobre portfólio de archviz e processo criativo. Mostre resultado real, mencione ferramentas usadas e cliente/parceiro quando possível.",
  ia_news: "Crie posts sobre IA aplicada à archviz. Perspectiva prática de quem usa no workflow real — Runway, Veo, Sora, Midjourney. Não reposte notícia sem opinião própria.",
  mercado: "Crie posts sobre mercado arquitetônico e colaborações. Associe o nome do autor a projetos e instituições relevantes como Perkins & Will.",
  opiniao: "Crie posts com ponto de vista pessoal sobre o futuro da profissão, IA e arquitetura. Opinioso mas não arrogante, abre para debate.",
  bastidores: "Crie posts de bastidores e processo. Tom casual e humano, mostra o lado real do trabalho.",
};

export default async function handler(req: Request): Promise<Response> {
  const secret = req.headers.get("X-Secret");
  if (secret !== process.env.AGENT_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let input: any;
  try {
    input = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { tipo = "ia_news", idioma = "pt+en", material = "", projeto = "", parceiro = "" } = input;
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
${material ? `MATERIAL: ${material}` : ""}

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
(descrição do visual ideal ou prompt para Midjourney)`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    const date = new Date().toISOString().split("T")[0];

    const draft = `---
tipo: ${tipo}
idioma: ${idioma}
data: ${new Date().toISOString()}
status: draft
projeto: "${projeto}"
parceiro: "${parceiro}"
---

${content}`;

    return new Response(
      JSON.stringify({ ok: true, draft, filename: `content/drafts/${date}-${tipo}.md` }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
