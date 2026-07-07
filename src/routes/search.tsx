import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";
import { Upload, Sparkles, X, Loader2 } from "lucide-react";
import { searchByImage } from "@/lib/image-search.functions";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Visual Search — Kumudha Jewelry" },
      {
        name: "description",
        content: "Upload a photo of any jewelry piece and our AI stylist will surface the closest matches from Kumudha Jewelry's collections.",
      },
      { property: "og:title", content: "Visual Search — Kumudha Jewelry" },
      { property: "og:description", content: "Find jewelry that looks like a piece you love." },
    ],
  }),
  component: SearchPage,
});

type Analysis = {
  jewelry_type: string;
  metals: string[];
  stones: string[];
  style_tags: string[];
  description: string;
};

function SearchPage() {
  const runSearch = useServerFn(searchByImage);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setErr(null);
      if (!file.type.startsWith("image/")) {
        setErr("Please upload an image file (JPG, PNG or WEBP).");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErr("Please upload an image smaller than 8 MB.");
        return;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setPreview(dataUrl);
      setLoading(true);
      setResults([]);
      setAnalysis(null);
      try {
        const res = await runSearch({ data: { imageDataUrl: dataUrl } });
        setAnalysis(res.analysis as Analysis);
        setResults(res.results as Product[]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [runSearch],
  );

  function onPick() { inputRef.current?.click(); }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dropRef.current?.classList.remove("ring-[var(--gold-deep)]");
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  }
  function reset() {
    setPreview(null);
    setResults([]);
    setAnalysis(null);
    setErr(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="container-luxe pt-12 md:pt-16 pb-24">
      <div className="text-center max-w-2xl mx-auto">
        <div className="eyebrow flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> AI Visual Search
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          Search by <em className="gold-shimmer not-italic">photograph</em>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Upload any jewelry image — a photo, a screenshot, a sketch — and we'll
          surface the closest pieces from our collections.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[380px_1fr]">
        {/* Upload panel */}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />
          {!preview ? (
            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                dropRef.current?.classList.add("ring-[var(--gold-deep)]");
              }}
              onDragLeave={() => dropRef.current?.classList.remove("ring-[var(--gold-deep)]")}
              onClick={onPick}
              role="button"
              tabIndex={0}
              className="cursor-pointer aspect-square grid place-items-center bg-secondary/40 hairline ring-1 ring-transparent transition"
            >
              <div className="text-center px-6">
                <div className="mx-auto h-14 w-14 rounded-full grid place-items-center border border-[var(--gold-deep)]/40">
                  <Upload className="h-5 w-5 text-[var(--gold-deep)]" />
                </div>
                <div className="mt-5 eyebrow">Upload a photo</div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Drop an image here, or click to browse. JPG / PNG / WEBP up to 8 MB.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-square overflow-hidden bg-secondary/40 hairline">
              <img src={preview} alt="Uploaded piece" className="h-full w-full object-cover" />
              <button
                onClick={reset}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:bg-background transition"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
              {loading && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur grid place-items-center">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full border-2 border-[var(--gold-soft)] border-t-[var(--gold-deep)] spin-ring" />
                    <div className="mt-4 eyebrow">Analyzing your piece</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {err && <p className="mt-3 text-xs text-destructive">{err}</p>}

          {analysis && !loading && (
            <div className="mt-6 hairline p-5 bg-card">
              <div className="eyebrow">We're seeing</div>
              <p className="mt-2 text-sm">{analysis.description}</p>
              {(analysis.style_tags?.length ?? 0) > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {analysis.style_tags.map((t) => (
                    <span key={t} className="text-[10px] uppercase tracking-[0.14em] border border-border px-2 py-1">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {!preview && (
            <div className="hairline bg-secondary/30 p-10 h-full grid place-items-center text-center">
              <div>
                <div className="eyebrow">How it works</div>
                <h2 className="mt-3 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
                  Three ways to find the piece
                </h2>
                <ol className="mt-6 text-sm text-muted-foreground space-y-3 max-w-md mx-auto text-left">
                  <li><b className="text-foreground">1.</b> Upload a picture you found — an inspiration photo or screenshot.</li>
                  <li><b className="text-foreground">2.</b> Our AI stylist reads the piece — metal, stones, style, silhouette.</li>
                  <li><b className="text-foreground">3.</b> We surface the closest matches from our collections.</li>
                </ol>
              </div>
            </div>
          )}
          {loading && preview && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-secondary animate-pulse" />
              ))}
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="eyebrow">Closest matches</div>
                  <h2 className="mt-1 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
                    {results.length} piece{results.length === 1 ? "" : "s"} found
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {results.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          )}
          {!loading && preview && results.length === 0 && !err && (
            <div className="text-center py-16 text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
