import { defineMcp } from "@lovable.dev/mcp-js";
import listCategories from "./tools/list-categories";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import searchProducts from "./tools/search-products";

export default defineMcp({
  name: "kumudha-jewelry-mcp",
  title: "Kumudha Jewelry",
  version: "0.1.0",
  instructions:
    "Read-only access to the Kumudha Jewelry public catalog. Use list_categories to see categories, list_products to browse (optionally filtered by category, featured, or new), search_products for keyword search, and get_product for full details with gallery images.",
  tools: [listCategories, listProducts, getProduct, searchProducts],
});
