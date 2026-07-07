import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Camera, Sparkles, Shield, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import heroImage from "@/assets/hero-necklace.jpg";
import type { Product, Category } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kumudha Jewelry — Heirloom craftsmanship, timeless design" },
      {
        name: "description",
        content:
          "Explore the Kumudha Jewelry digital showroom: temple, bridal, diamond and gold pieces hand-finished by our master artisans.",
      },
      {
        property: "og:image",
        content: "/images/hero-necklace.jpg",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: featured = [] } = useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: newArrivals = [] } = useQuery<Product[]>({
    queryKey: ["products", "new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_new", true)
        .order("sort_order")
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-luxe grid gap-10 md:grid-cols-2 items-center pt-10 md:pt-16 pb-20 md:pb-28">
          <div className="fade-up">
            <div className="eyebrow">The Divine Heritage Collection</div>
            <h1
              className="mt-5 text-5xl md:text-6xl lg:text-7xl leading-[1.02]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ornaments <br />
              made to be <em className="gold-shimmer not-italic">remembered</em>.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
              Kumudha Jewelry is a family atelier of temple, bridal and diamond
              jewelry — every piece hand-finished, hallmarked, and made for the
              moments that matter.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/collections" className="btn-ink">
                Explore the Collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/search" className="btn-outline-gold">
                <Camera className="h-4 w-4" /> Search by Photo
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 md:-inset-10 bg-gradient-to-br from-[var(--gold-soft)]/50 via-transparent to-[var(--gold-deep)]/10 blur-2xl" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={heroImage}
                alt="Signature Kumudha gold temple pendant with ruby drops"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-[var(--gold-deep)]/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Visual search callout */}
      <section className="container-luxe">
        <div className="hairline p-8 md:p-12 grid gap-6 md:grid-cols-[1fr_auto] items-center bg-secondary/30">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Visual search
            </div>
            <h2 className="mt-3 text-2xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              Have a picture of a piece you love?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Upload any jewelry photo and our AI stylist will surface the closest
              pieces from our collections. No cart. No checkout. Just curated matches.
            </p>
          </div>
          <Link to="/search" className="btn-ink shrink-0">
            Try visual search <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container-luxe mt-24 md:mt-32">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="eyebrow">Shop by category</div>
            <h2 className="mt-2 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              A curated house of ornaments
            </h2>
          </div>
          <Link to="/collections" className="text-sm hover:text-[var(--gold-deep)] hidden md:inline-flex items-center gap-2">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/collections"
              search={{ category: c.slug }}
              className="group relative overflow-hidden aspect-[4/5] bg-secondary hairline"
            >
              <div className="absolute inset-0 grid place-items-center text-center p-6">
                <div>
                  <Gem className="h-6 w-6 mx-auto text-[var(--gold-deep)] opacity-70 group-hover:opacity-100 transition" />
                  <div className="eyebrow mt-4">{c.name}</div>
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {c.description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-luxe mt-24 md:mt-32">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow">Featured pieces</div>
          <h2 className="mt-3 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            The collector's shelf
          </h2>
          <div className="gold-rule mt-6 max-w-[80px] mx-auto" />
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="container-luxe mt-24 md:mt-32">
        <div className="grid gap-10 md:grid-cols-4 text-center">
          {[
            { icon: Shield, title: "Hallmarked", body: "BIS-certified purity on every piece." },
            { icon: Gem, title: "Fine craftsmanship", body: "Hand-finished by master artisans." },
            { icon: Sparkles, title: "Timeless design", body: "Made to be worn — and inherited." },
            { icon: Camera, title: "Personal service", body: "Message us on WhatsApp for any piece." },
          ].map((f) => (
            <div key={f.title}>
              <f.icon className="h-6 w-6 mx-auto text-[var(--gold-deep)]" />
              <div className="mt-4 eyebrow">{f.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-luxe mt-24 md:mt-32">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <div className="eyebrow">Just arrived</div>
              <h2 className="mt-2 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                New this season
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-luxe mt-24 md:mt-32">
        <div className="hairline bg-[var(--ink)] text-[var(--cream)] px-8 py-16 md:py-20 text-center">
          <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>Personal appointments</div>
          <h2 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Every piece has a story. Let's find yours.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-outline-gold" style={{ color: "var(--cream)", borderColor: "var(--gold-soft)" }}>
              Visit the boutique
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
