import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/product-form";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/$productId")({
  component: EditProduct,
});

function EditProduct() {
  const { productId } = Route.useParams();
  const { data: product, isLoading } = useQuery<Product | null>({
    queryKey: ["admin-product", productId],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-4 text-3xl" style={{ fontFamily: "var(--font-display)" }}>Edit product</h1>
      <div className="mt-8">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : product ? (
          <ProductForm product={product} />
        ) : (
          <div className="text-sm text-muted-foreground">Not found.</div>
        )}
      </div>
    </div>
  );
}
