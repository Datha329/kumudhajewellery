import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "list_categories",
  title: "List jewelry categories",
  description:
    "List Kumudha Jewelry catalog categories (Necklaces, Rings, Earrings, etc.) with their slugs and descriptions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order")
      .order("sort_order", { ascending: true });
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { categories: data ?? [] },
    };
  },
});

// unused import guard
void z;
