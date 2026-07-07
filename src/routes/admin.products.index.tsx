import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsList,
});

function ProductsList() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function del(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="eyebrow">Catalog</div>
          <h1 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)" }}>Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} pieces</p>
        </div>
        <Link to="/admin/products/new" className="btn-ink">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </div>

      <div className="mt-8 hairline bg-background divide-y divide-border">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 bg-secondary shrink-0 overflow-hidden">
              {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground truncate">{p.collection}</div>
              <div className="mt-1 flex gap-2">
                {p.is_featured && <span className="text-[10px] uppercase tracking-widest text-[var(--gold-deep)] inline-flex items-center gap-1"><Star className="h-3 w-3" /> Featured</span>}
                {p.is_new && <span className="text-[10px] uppercase tracking-widest inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> New</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/admin/products/$productId"
                params={{ productId: p.id }}
                className="p-2 hover:bg-secondary rounded"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button onClick={() => del(p)} className="p-2 hover:bg-secondary rounded text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {!products.length && <div className="p-6 text-sm text-muted-foreground">No products yet.</div>}
      </div>
    </div>
  );
}
