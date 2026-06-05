import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = req.headers["x-secret"];
  if (secret !== process.env.AGENT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tipo = req.query.tipo as string;

  try {
    if (tipo === "ia_news") {
      const result = await fetchAINews();
      return res.status(200).json(result);
    }
    if (tipo === "mercado") {
      const result = await fetchMarketNews();
      return res.status(200).json(result);
    }
    return res.status(200).json({ results: [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async function fetchAINews() {
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?query=AI+architecture+visualization&tags=story&hitsPerPage=5`
  );
  const data = await res.json();
  const results = (data.hits || []).slice(0, 5).map((h: any) => ({
    title: h.title,
    summary: h.story_text?.replace(/<[^>]*>/g, "").slice(0, 200) || h.title,
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
  }));
  return { results };
}

async function fetchMarketNews() {
  try {
    const res = await fetch("https://feeds.feedburner.com/archdaily");
    const text = await res.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const results: any[] = [];
    let match;
    while ((match = itemRegex.exec(text)) !== null && results.length < 5) {
      const item = match[1];
      const title = titleRegex.exec(item)?.[1]?.trim();
      const link = linkRegex.exec(item)?.[1]?.trim();
      if (title && link) results.push({ title, summary: title, url: link });
    }
    return { results };
  } catch {
    return { results: [] };
  }
}
