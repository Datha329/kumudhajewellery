import { useState } from "react";

type Img = { url: string; alt: string };
type GalleryImg = { image_url: string; alt: string | null };

export function ProductGallery({ main, gallery }: { main: Img; gallery: GalleryImg[] }) {
  const all: Img[] = [main, ...gallery.map((g) => ({ url: g.image_url, alt: g.alt ?? main.alt }))];
  const [active, setActive] = useState(0);
  const current = all[active] ?? main;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-secondary/40 hairline">
        <img
          src={current.url}
          alt={current.alt}
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-opacity duration-500"
        />
      </div>
      {all.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {all.map((im, i) => (
            <button
              key={im.url + i}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden bg-secondary/40 border transition ${
                i === active ? "border-[var(--gold-deep)]" : "border-transparent hover:border-border"
              }`}
            >
              <img src={im.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
