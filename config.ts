// ============================================================
// config.ts — Configurações centrais do agente
// Edite aqui para personalizar sem tocar nos outros arquivos
// ============================================================

export const AGENT_CONFIG = {
  // Seu nome e bio para o system prompt
  author: {
    name: "Henrique",
    role: "Arquiteto e diretor criativo de archviz",
    company: "Perkins & Will | PW LABs",
    location: "São Paulo, Brasil",
    tools: ["Runway Gen-4.5", "Veo 3", "Sora 2", "Midjourney", "After Effects"],
    languages: ["pt", "en"],
  },

  // Pilares de conteúdo com pesos de frequência
  pillars: [
    { id: "portfolio",   label: "Portfólio e processo",    weight: 40, platforms: ["instagram"] },
    { id: "ia_news",     label: "IA aplicada à archviz",   weight: 25, platforms: ["instagram", "linkedin"] },
    { id: "mercado",     label: "Mercado e colaborações",   weight: 20, platforms: ["linkedin"] },
    { id: "opiniao",     label: "Ponto de vista pessoal",   weight: 10, platforms: ["instagram", "linkedin"] },
    { id: "bastidores",  label: "Bastidores e humanização", weight: 5,  platforms: ["instagram"] },
  ],

  // Limites de caracteres por plataforma
  limits: {
    instagram: { caption: 300, hashtags: 8 },
    linkedin:  { text: 1200,  hashtags: 3 },
  },

  // Hashtags fixas por pilar (curadas, não genéricas)
  hashtags: {
    portfolio:   ["#archviz", "#architecturevisualization", "#render3d", "#archvizartist", "#architecturerender"],
    ia_news:     ["#aiarchitecture", "#archvizai", "#generativeai", "#airendering", "#futureofdesign"],
    mercado:     ["#architecture", "#perkinswill", "#architecturebrasil", "#realestatedesign"],
    opiniao:     ["#archviz", "#architecturethoughts", "#designfuture"],
    bastidores:  ["#archvizbehindthescenes", "#3dworkflow", "#archvizprocess"],
  },
} as const;

export type PillarId = typeof AGENT_CONFIG.pillars[number]["id"];
export type Platform = "instagram" | "linkedin";
export type Language = "pt" | "en" | "pt+en";
