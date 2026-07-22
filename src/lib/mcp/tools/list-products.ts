import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List jewelry products",
  description:
    "List products from the Kumudha Jewelry catalog. Filter by category slug, featured flag, or new-arrival flag. Returns a compact list; use get_product for full details and gallery.",
  inputSchema: {
    categorySlug: z.string().optional().describe("Category slug, e.g. 'necklaces'."),
    featured: z.boolean().optional().describe("Only featured products."),
    isNew: z.boolean().optional().describe("Only products marked as new arrivals."),
    limit: z.number().int().min(1).max(100).optional().describe("Max items (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ categorySlug, featured, isNew, limit }) => {
    const supabase = getPublicSupabase();
    let query = supabase
      .from("products")
      .select(
        "id, name, slug, short_description, metal, purity, jewelry_type, collection, stones, style_tags, is_featured, is_new, is_bestseller, image_url, category:categories(name, slug)"
      )
      .order("sort_order", { ascending: true })
      .limit(limit ?? 50);

    if (featured) query = query.eq("is_featured", true);
    if (isNew) query = query.eq("is_new", true);

    if (categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();
      if (!cat) {
        return {
          content: [{ type: "text", text: `No category found for slug "${categorySlug}".` }],
          isError: true,
        };
      }
      query = query.eq("category_id", cat.id);
    }

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
