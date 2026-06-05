// ============================================================
// api/generate.ts — Vercel Function principal
// Recebe o input, busca contexto e chama Claude para gerar os posts
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { AGENT_CONFIG, PillarId, Language } from "../config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GenerateInput {
  tipo: PillarId;
  idioma: Language;
  material?: string;       // Texto bruto com o conteúdo do projeto
  tom?: string;            // tecnico | inspirador | analitico | casual
  cta?: string;            // salve | comente | siga | link_bio | sem_cta
  projeto?: string;        // Nome do projeto para mencionar
  parceiro?: string;       // Ex: "Perkins & Will", "Pueri Domus"
}

export default async function handler(req: Request): Promise<Response> {
  // Autenticação básica via secret header
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

  let input: GenerateInput;
  try {
    input = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { tipo, idioma, material, tom, cta, projeto, parceiro } = input;

  // Busca contexto automático para pilares que dependem de notícias
  let contexto = "";
  if (tipo === "ia_news" || tipo === "mercado") {
    try {
      const searchUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/api/search?tipo=${tipo}`;
      const res = await fetch(searchUrl, {
        headers: { "X-Secret": process.env.AGENT_SECRET || "" },
      });
      const data = await res.json();
      contexto = data.results
        .slice(0, 3)
        .map((r: { title: string; summary: string; url?: string }) =>
          `- ${r.title}${r.url ? ` (${r.url})` : ""}\n  ${r.summary}`
        )
        .join("\n\n");
    } catch (e) {
      contexto = "Contexto não disponível — use o material bruto fornecido.";
    }
  }

  const { author, limits, hashtags } = AGENT_CONFIG;
  const pillar = AGENT_CONFIG.pillars.find((p) => p.id === tipo);
  const tags = hashtags[tipo as keyof typeof hashtags] || [];

  const systemPrompt = `Você é o agente de social media de ${author.name}, ${author.role} na ${author.company}, baseado em ${author.location}.

PERFIL DO AUTOR:
- Arquiteto com sólida experiência em visualização arquitetônica avançada
- Usa ativamente ferramentas de IA generativa no workflow real: ${author.tools.join(", ")}
- Lidera o PW LABs, unidade de inteligência criativa da Perkins & Will
- Foco em projetos internacionais, com interesse em atrair clientes americanos
- Tom: técnico mas acessível, opinionado, sem euforia, sem exageros

OBJETIVOS dos posts:
1. Reconhecimento de marca pessoal
2. Atração de leads para o escritório
3. Formação de opinião sobre IA + arquitetura
4. Valorização profissional percebida

REGRAS DE VOZ:
- Nunca use frases genéricas como "No mundo atual..." ou "Em tempos de IA..."
- Prefira "Testei isso no projeto X" a "Vi que existe isso"
- Mencione parceiros/clientes quando autorizado (gera credibilidade)
- LinkedIn: profissional, sem hashtags excessivas, texto corrido
- Instagram: impactante na primeira linha, até ${limits.instagram.caption} chars na legenda
- Nunca use mais de ${limits.instagram.hashtags} hashtags no Instagram
- Nunca use mais de ${limits.linkedin.hashtags} hashtags no LinkedIn`;

  const userPrompt = `PILAR: ${pillar?.label || tipo}
TIPO: ${tipo}
IDIOMA DESEJADO: ${idioma}
TOM: ${tom || "profissional e direto"}
CTA: ${cta || "pergunta aberta que gere comentário"}
${projeto ? `PROJETO: ${projeto}` : ""}
${parceiro ? `PARCEIRO/CLIENTE: ${parceiro}` : ""}

MATERIAL BRUTO:
${material || "Não fornecido — use o contexto buscado abaixo."}

CONTEXTO BUSCADO (notícias/posts recentes):
${contexto || "Não aplicável para este tipo de post."}

HASHTAGS SUGERIDAS PARA ESTE PILAR:
${tags.join(", ")}

---
Gere os seguintes outputs, separados por "---":

1. ## INSTAGRAM PT
(legenda completa em português, até ${limits.instagram.caption} chars + hashtags em linha separada)

2. ## INSTAGRAM EN
(caption in English, up to ${limits.instagram.caption} chars + hashtags)

3. ## LINKEDIN PT
(texto completo em português, até ${limits.linkedin.text} chars, tom mais profissional)

4. ## LINKEDIN EN
(full text in English, up to ${limits.linkedin.text} chars)

5. ## VISUAL
(descrição do visual ideal ou prompt para Midjourney/Firefly se não houver imagem)

6. ## NOTAS
(observações sobre o post: melhor horário, sugestão de Stories, variações possíveis)`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Monta o draft com frontmatter
    const date = new Date().toISOString().split("T")[0];
    const draft = `---
tipo: ${tipo}
pilar: "${pillar?.label}"
idioma: ${idioma}
data: ${new Date().toISOString()}
status: draft
projeto: "${projeto || ""}"
parceiro: "${parceiro || ""}"
tom: ${tom || "profissional"}
---

${content}
`;

    return new Response(
      JSON.stringify({
        ok: true,
        draft,
        filename: `content/drafts/${date}-${tipo}.md`,
        tokens: response.usage,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
