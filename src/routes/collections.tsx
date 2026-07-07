import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import type { Category, Product } from "@/lib/types";

const searchSchema = z.object({
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/collections")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Collections — Kumudha Jewelry" },
      { name: "description", content: "Browse temple, bridal, diamond and gold jewelry from Kumudha Jewelry's curated collections." },
      { property: "og:title", content: "Collections — Kumudha Jewelry" },
      { property: "og:description", content: "Explore our full catalog of hand-finished jewelry." },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { category } = Route.useSearch();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const activeCat = categories.find((c) => c.slug === category);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products", "list", category ?? "all"],
    queryFn: async () => {
      let q = supabase.from("products").select("*").order("sort_order");
      if (category) {
        const cat = categories.find((c) => c.slug === category);
        if (cat) q = q.eq("category_id", cat.id);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !category || categories.length > 0,
  });

  return (
    <div className="container-luxe pt-12 md:pt-16 pb-24">
      <div className="text-center max-w-2xl mx-auto">
        <div className="eyebrow">The collections</div>
        <h1 className="mt-3 text-4xl md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          {activeCat ? activeCat.name : "Every ornament, on one shelf"}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {activeCat?.description ?? "Browse our full catalog. Message us on WhatsApp for prices and availability."}
        </p>
        <div className="gold-rule mt-8 max-w-[80px] mx-auto" />
      </div>

      {/* Filter chips */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        <Link
          to="/collections"
          search={{ category: "" }}
          className={`text-xs uppercase tracking-[0.16em] px-4 py-2 border transition ${
            !category
              ? "bg-[var(--ink)] text-[var(--cream)] border-[var(--ink)]"
              : "border-border hover:border-[var(--gold-deep)]"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/collections"
            search={{ category: c.slug }}
            className={`text-xs uppercase tracking-[0.16em] px-4 py-2 border transition ${
              category === c.slug
                ? "bg-[var(--ink)] text-[var(--cream)] border-[var(--ink)]"
                : "border-border hover:border-[var(--gold-deep)]"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-secondary animate-pulse" />
            ))
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {!isLoading && products.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-24">
          No pieces in this category yet.
        </p>
      )}
    </div>
  );
}
