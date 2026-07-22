import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "get_product",
  title: "Get jewelry product details",
  description:
    "Get full details for one Kumudha Jewelry product by slug, including all gallery images, metal, stones, dimensions, care instructions, and category.",
  inputSchema: {
    slug: z.string().min(1).describe("Product slug from list_products."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = getPublicSupabase();
    const { data: product, error } = await supabase
      .from("products")
      .select(
        "*, category:categories(name, slug), gallery:product_images(image_url, alt, sort_order)"
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    if (!product) {
      return {
        content: [{ type: "text", text: `No product found for slug "${slug}".` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
