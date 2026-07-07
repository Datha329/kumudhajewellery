import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const InputSchema = z.object({
  imageDataUrl: z.string().min(32).max(15_000_000),
});

const AnalysisSchema = z.object({
  jewelry_type: z.string().optional().default(""),
  metals: z.array(z.string()).optional().default([]),
  stones: z.array(z.string()).optional().default([]),
  style_tags: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(""),
});

type Analysis = z.infer<typeof AnalysisSchema>;

/**
 * Visual similarity search:
 * 1. Ask Gemini vision to analyze the uploaded image and extract jewelry
 *    attributes (type, metal, stones, style tags).
 * 2. Score every product in the catalog against those attributes and return
 *    the top matches with the analysis for context.
 */
export const searchByImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Lovable AI is not configured.");

    // 1. Ask the vision model to describe the jewelry in structured JSON.
    const prompt = `You are a jewelry expert. Analyze the piece of jewelry in this photo and reply with ONLY a JSON object (no markdown, no prose) using this exact schema:
{
  "jewelry_type": "necklace" | "earring" | "ring" | "bangle" | "bracelet" | "pendant" | "necklace-set" | "other",
  "metals": string[],           // e.g. ["yellow gold"], ["white gold"], ["rose gold"], ["silver"]
  "stones": string[],           // e.g. ["diamond","ruby","emerald","pearl","kundan","none"]
  "style_tags": string[],       // 3-8 short descriptors: e.g. ["temple","antique","bridal","minimal","solitaire","chandelier","filigree"]
  "description": string         // one short sentence describing the piece
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) throw new Error("Too many requests — please try again in a moment.");
      if (aiRes.status === 402) throw new Error("AI credits exhausted. Please contact support.");
      throw new Error(`Vision request failed: ${text.slice(0, 200)}`);
    }

    const json = (await aiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    let raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    // Strip code fences if the model wrapped them anyway.
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
    let analysis: Analysis;
    try {
      analysis = AnalysisSchema.parse(JSON.parse(raw));
    } catch {
      analysis = { jewelry_type: "", metals: [], stones: [], style_tags: [], description: raw.slice(0, 200) };
    }

    // 2. Load the catalog with the server publishable client (RLS-safe reads).
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data: products, error } = await supabase.from("products").select("*");
    if (error) throw new Error(error.message);

    // 3. Score every product against the analysis.
    const wantType = (analysis.jewelry_type || "").toLowerCase();
    const wantMetals = analysis.metals.map((m) => m.toLowerCase());
    const wantStones = analysis.stones.map((s) => s.toLowerCase());
    const wantTags = analysis.style_tags.map((t) => t.toLowerCase());

    const scored = (products ?? []).map((p) => {
      let score = 0;
      const pType = (p.jewelry_type ?? "").toLowerCase();
      if (wantType && pType && (pType === wantType || pType.includes(wantType) || wantType.includes(pType))) {
        score += 5;
      }
      const pMetal = (p.metal ?? "").toLowerCase();
      for (const m of wantMetals) if (m && pMetal.includes(m.split(" ").pop() ?? m)) score += 2;
      const pStones = (p.stones ?? []).map((s) => s.toLowerCase());
      for (const s of wantStones) if (s && s !== "none" && pStones.some((ps) => ps.includes(s) || s.includes(ps))) score += 2;
      const pTags = (p.style_tags ?? []).map((t) => t.toLowerCase());
      for (const t of wantTags) if (t && pTags.some((pt) => pt.includes(t) || t.includes(pt))) score += 1;
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const matches = scored.filter((s) => s.score > 0).slice(0, 6).map((s) => s.product);
    // Fallback: if nothing scored, still return top featured products.
    const results = matches.length > 0
      ? matches
      : (products ?? []).filter((p) => p.is_featured).slice(0, 6);

    return { analysis, results };
  });
