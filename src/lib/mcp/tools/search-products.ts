import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "search_products",
  title: "Search jewelry products",
  description:
    "Search Kumudha Jewelry products by keyword across name, description, collection, metal, and style tags.",
  inputSchema: {
    query: z.string().min(1).describe("Search text, e.g. 'temple necklace' or 'bridal ring'."),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = getPublicSupabase();
    const q = query.replace(/[%,()]/g, " ").trim();
    const pattern = `%${q}%`;
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, short_description, metal, collection, jewelry_type, image_url, is_featured"
      )
      .or(
        `name.ilike.${pattern},description.ilike.${pattern},short_description.ilike.${pattern},collection.ilike.${pattern},metal.ilike.${pattern}`
      )
      .limit(limit ?? 20);
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { results: data ?? [] },
    };
  },
});
