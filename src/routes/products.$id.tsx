import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Product — Kumudha Jewelry" },
      { name: "description", content: "View this handcrafted piece from Kumudha Jewelry." },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="container-luxe py-24 text-center">
      <div className="eyebrow">Not found</div>
      <h1 className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
        This piece is no longer available
      </h1>
      <Link to="/collections" className="btn-ink mt-8 inline-flex">Browse collections</Link>
    </div>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();

  const { data: product, isLoading, error } = useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: gallery = [] } = useQuery<{ image_url: string; alt: string | null }[]>({
    queryKey: ["product-gallery", product?.id],
    enabled: !!product,
    queryFn: async () => {
      if (!product) return [];
      const { data, error } = await supabase
        .from("product_images")
        .select("image_url, alt")
        .eq("product_id", product.id)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: related = [] } = useQuery<Product[]>({
    queryKey: ["related", product?.category_id, product?.id],
    enabled: !!product,
    queryFn: async () => {
      if (!product) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", product.category_id ?? "")
        .neq("id", product.id)
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="container-luxe py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-secondary animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-32 bg-secondary animate-pulse" />
            <div className="h-10 w-3/4 bg-secondary animate-pulse" />
            <div className="h-4 w-full bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    throw notFound();
  }

  const details = [
    ["SKU", product.sku],
    ["Category", product.jewelry_type],
    ["Collection", product.collection],
    ["Metal", product.metal],
    ["Purity", product.purity],
    ["Weight", product.weight],
    ["Stones", product.stones?.join(", ") || null],
    ["Dimensions", product.dimensions],
    ["Availability", product.availability],
  ].filter(([, v]) => !!v);

  return (
    <div className="container-luxe pt-8 pb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/collections" className="hover:text-foreground">Collections</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:gap-16 md:grid-cols-2 items-start">
        {/* Gallery */}
        <ProductGallery
          main={{ url: product.image_url, alt: product.image_alt ?? product.name }}
          gallery={gallery}
        />

        {/* Info */}
        <div className="fade-up">
          {product.collection && <div className="eyebrow">{product.collection}</div>}
          <h1 className="mt-3 text-3xl md:text-4xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {product.name}
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton
              productId={product.id}
              productName={product.name}
              sku={product.sku}
              source="product-detail"
            />
          </div>

          <div className="mt-8 gold-rule" />

          {/* Detail table */}
          <dl className="mt-8 grid grid-cols-2 gap-y-4 text-sm">
            {details.map(([k, v]) => (
              <div key={k as string} className="col-span-1">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          {product.care_instructions && (
            <div className="mt-8">
              <div className="eyebrow">Care</div>
              <p className="mt-2 text-sm text-muted-foreground">{product.care_instructions}</p>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: Sparkles, label: "Hand-finished" },
              { icon: Truck, label: "Insured delivery" },
              { icon: ShieldCheck, label: "Lifetime care" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center">
                <Icon className="h-5 w-5 mx-auto text-[var(--gold-deep)]" />
                <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <div className="text-center">
            <div className="eyebrow">You may also love</div>
            <h2 className="mt-2 text-2xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              From the same collection
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
