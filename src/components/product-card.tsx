import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$id"
      params={{ id: product.slug }}
      className="group block card-luxe"
    >
      <div className="relative overflow-hidden bg-secondary/50 aspect-[4/5]">
        <img
          src={product.image_url}
          alt={product.image_alt ?? product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        {(product.is_new || product.is_bestseller) && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_new && (
              <span className="eyebrow bg-background/85 backdrop-blur px-2 py-1">New</span>
            )}
            {product.is_bestseller && (
              <span className="eyebrow bg-[var(--ink)] text-[var(--cream)] px-2 py-1">
                Bestseller
              </span>
            )}
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-inset ring-[var(--gold-deep)]/60 pointer-events-none" />
      </div>
      <div className="pt-5 pb-2 text-center">
        {product.collection && <div className="eyebrow">{product.collection}</div>}
        <h3 className="mt-1.5 text-lg" style={{ fontFamily: "var(--font-display)" }}>
          {product.name}
        </h3>
        {product.short_description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {product.short_description}
          </p>
        )}
      </div>
    </Link>
  );
}
