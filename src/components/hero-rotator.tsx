import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroFallback from "@/assets/hero-necklace.jpg";

export function HeroRotator({ className = "" }: { className?: string }) {
  const { data: images = [] } = useQuery<string[]>({
    queryKey: ["hero-rotator"],
    queryFn: async () => {
      const { data: featured } = await supabase
        .from("products")
        .select("id, image_url")
        .eq("is_featured", true)
        .order("sort_order");
      const ids = (featured ?? []).map((p) => p.id);
      let gallery: { image_url: string; product_id: string; sort_order: number }[] = [];
      if (ids.length) {
        const { data } = await supabase
          .from("product_images")
          .select("image_url, product_id, sort_order")
          .in("product_id", ids)
          .order("sort_order");
        gallery = data ?? [];
      }
      const urls: string[] = [];
      for (const p of featured ?? []) {
        if (p.image_url) urls.push(p.image_url);
        for (const g of gallery.filter((x) => x.product_id === p.id)) urls.push(g.image_url);
      }
      // Dedupe & fall back
      const unique = Array.from(new Set(urls));
      return unique.length ? unique : [heroFallback];
    },
  });

  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setI((x) => (x + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className={`relative aspect-[4/5] overflow-hidden ${className}`}>
      {images.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 ring-1 ring-inset ring-[var(--gold-deep)]/30" />
    </div>
  );
}
