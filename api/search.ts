// ============================================================
// api/search.ts — Vercel Function de busca de contexto
// Busca notícias de IA e posts da Perkins & Will via RSS/APIs públicas
// ============================================================

export default async function handler(req: Request): Promise<Response> {
  const secret = req.headers.get("X-Secret");
  if (secret !== process.env.AGENT_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  try {
    if (tipo === "ia_news") {
      return await fetchAINews();
    }

    if (tipo === "mercado") {
      return await fetchMarketNews();
    }

    return Response.json({ results: [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro";
    return Response.json({ results: [], error: message });
  }
}

// ── Notícias de IA via Hacker News Algolia API (gratuito, sem key) ──
async function fetchAINews(): Promise<Response> {
  const queries = [
    "AI architecture visualization",
    "generative AI rendering",
    "AI archviz",
  ];

  const results: Array<{ title: string; summary: string; url: string }> = [];

  for (const q of queries) {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=3&numericFilters=created_at_i>=${Math.floor(Date.now() / 1000) - 7 * 24 * 3600}`
    );
    const data = await res.json();

    for (const hit of data.hits || []) {
      if (hit.title && !results.find((r) => r.title === hit.title)) {
        results.push({
          title: hit.title,
          summary: hit.story_text
            ? hit.story_text.replace(/<[^>]*>/g, "").slice(0, 200)
            : hit.title,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        });
      }
    }
  }

  return Response.json({ results: results.slice(0, 5) });
}

// ── Posts da Perkins & Will via RSS público ──
async function fetchMarketNews(): Promise<Response> {
  const feeds = [
    "https://perkinswill.com/feed/",
    "https://feeds.feedburner.com/archdaily",  // ArchDaily fallback
  ];

  const results: Array<{ title: string; summary: string; url: string }> = [];

  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "SocialMediaAgent/1.0" },
      });
      const text = await res.text();

      // Parse RSS simples via regex (sem dependências externas)
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
      const linkRegex = /<link>(.*?)<\/link>/;
      const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/;

      let match;
      while ((match = itemRegex.exec(text)) !== null && results.length < 5) {
        const item = match[1];
        const title = titleRegex.exec(item)?.[1]?.trim();
        const link = linkRegex.exec(item)?.[1]?.trim();
        const desc = descRegex.exec(item)?.[1]
          ?.replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim()
          .slice(0, 200);

        if (title && link) {
          results.push({
            title,
            summary: desc || title,
            url: link,
          });
        }
      }
    } catch {
      // Feed falhou, tenta o próximo
      continue;
    }
  }

  return Response.json({ results });
}
