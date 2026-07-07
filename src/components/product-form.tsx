import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Upload, X, GripVertical, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadProductImage } from "@/lib/storage";
import type { Category, Product } from "@/lib/types";

type ProductImage = { id?: string; image_url: string; alt?: string | null; sort_order: number };

export function ProductForm({ product }: { product?: Product }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isEdit = !!product;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? "",
    collection: product?.collection ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    jewelry_type: product?.jewelry_type ?? "",
    metal: product?.metal ?? "",
    purity: product?.purity ?? "",
    weight: product?.weight ?? "",
    stones: (product?.stones ?? []).join(", "),
    style_tags: (product?.style_tags ?? []).join(", "),
    dimensions: product?.dimensions ?? "",
    care_instructions: product?.care_instructions ?? "",
    availability: product?.availability ?? "In Stock",
    image_url: product?.image_url ?? "",
    image_alt: product?.image_alt ?? "",
    is_featured: product?.is_featured ?? false,
    is_new: product?.is_new ?? false,
    is_bestseller: product?.is_bestseller ?? false,
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product) return;
    supabase.from("product_images").select("*").eq("product_id", product.id).order("sort_order").then(({ data }) => {
      setImages(data ?? []);
    });
  }, [product]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleUpload(files: FileList | null, target: "main" | "gallery") {
    if (!files?.length) return;
    setUploading(true);
    try {
      if (target === "main") {
        const url = await uploadProductImage(files[0]);
        set("image_url", url);
      } else {
        const remaining = 10 - images.length;
        const toUpload = Array.from(files).slice(0, remaining);
        const urls = await Promise.all(toUpload.map(uploadProductImage));
        setImages((prev) => [
          ...prev,
          ...urls.map((image_url, i) => ({ image_url, sort_order: prev.length + i })),
        ]);
      }
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx).map((im, i) => ({ ...im, sort_order: i })));
  }
  function moveImage(idx: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((im, i) => ({ ...im, sort_order: i }));
    });
  }

  async function save() {
    if (!form.name) return toast.error("Name required");
    if (!form.image_url) return toast.error("Main image required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        category_id: form.category_id || null,
        stones: form.stones.split(",").map((s) => s.trim()).filter(Boolean),
        style_tags: form.style_tags.split(",").map((s) => s.trim()).filter(Boolean),
      };

      let productId = product?.id;
      if (isEdit && productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      if (productId) {
        // Replace gallery: delete existing then insert current
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (images.length) {
          const rows = images.map((im, i) => ({
            product_id: productId!,
            image_url: im.image_url,
            alt: im.alt ?? null,
            sort_order: i,
          }));
          const { error } = await supabase.from("product_images").insert(rows);
          if (error) throw error;
        }
      }

      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products", "featured"] });
      qc.invalidateQueries({ queryKey: ["products", "new"] });
      navigate({ to: "/admin/products" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-5">
          <Field label="Name">
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full h-11 px-3 border border-border rounded-md text-sm" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug (URL)">
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
                placeholder="auto-generated" className="w-full h-11 px-3 border border-border rounded-md text-sm" />
            </Field>
            <Field label="SKU">
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)}
                className="w-full h-11 px-3 border border-border rounded-md text-sm" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)}
                className="w-full h-11 px-3 border border-border rounded-md text-sm bg-background">
                <option value="">— Select —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Collection">
              <input value={form.collection} onChange={(e) => set("collection", e.target.value)}
                className="w-full h-11 px-3 border border-border rounded-md text-sm" />
            </Field>
          </div>
          <Field label="Short description">
            <input value={form.short_description} onChange={(e) => set("short_description", e.target.value)}
              className="w-full h-11 px-3 border border-border rounded-md text-sm" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5}
              className="w-full p-3 border border-border rounded-md text-sm" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Jewelry type"><input value={form.jewelry_type} onChange={(e) => set("jewelry_type", e.target.value)} className="w-full h-11 px-3 border border-border rounded-md text-sm" /></Field>
            <Field label="Metal"><input value={form.metal} onChange={(e) => set("metal", e.target.value)} className="w-full h-11 px-3 border border-border rounded-md text-sm" /></Field>
            <Field label="Purity"><input value={form.purity} onChange={(e) => set("purity", e.target.value)} className="w-full h-11 px-3 border border-border rounded-md text-sm" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Weight"><input value={form.weight} onChange={(e) => set("weight", e.target.value)} className="w-full h-11 px-3 border border-border rounded-md text-sm" /></Field>
            <Field label="Dimensions"><input value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} className="w-full h-11 px-3 border border-border rounded-md text-sm" /></Field>
          </div>
          <Field label="Stones (comma separated)">
            <input value={form.stones} onChange={(e) => set("stones", e.target.value)}
              placeholder="Diamond, Ruby" className="w-full h-11 px-3 border border-border rounded-md text-sm" />
          </Field>
          <Field label="Style tags (comma separated)">
            <input value={form.style_tags} onChange={(e) => set("style_tags", e.target.value)}
              placeholder="bridal, temple, antique" className="w-full h-11 px-3 border border-border rounded-md text-sm" />
          </Field>
          <Field label="Care instructions">
            <textarea value={form.care_instructions} onChange={(e) => set("care_instructions", e.target.value)} rows={3}
              className="w-full p-3 border border-border rounded-md text-sm" />
          </Field>
          <Field label="Availability">
            <input value={form.availability} onChange={(e) => set("availability", e.target.value)}
              className="w-full h-11 px-3 border border-border rounded-md text-sm" />
          </Field>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="hairline p-4 bg-background">
            <div className="eyebrow mb-3">Main image</div>
            {form.image_url ? (
              <div className="relative">
                <img src={form.image_url} alt="" className="w-full aspect-square object-cover" />
                <button onClick={() => set("image_url", "")}
                  className="absolute top-2 right-2 bg-background/80 p-1 rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="aspect-square border-2 border-dashed border-border grid place-items-center cursor-pointer text-xs text-muted-foreground hover:bg-secondary">
                <div className="text-center">
                  <Upload className="h-5 w-5 mx-auto mb-2" />
                  Upload photo
                </div>
                <input type="file" accept="image/*" hidden
                  onChange={(e) => handleUpload(e.target.files, "main")} />
              </label>
            )}
            <input value={form.image_alt} onChange={(e) => set("image_alt", e.target.value)}
              placeholder="Alt text"
              className="mt-3 w-full h-9 px-2 border border-border rounded text-xs" />
          </div>

          <div className="hairline p-4 bg-background">
            <div className="flex items-center gap-2 mb-3">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
                Featured
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer mr-4">
              <input type="checkbox" checked={form.is_new} onChange={(e) => set("is_new", e.target.checked)} /> New
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_bestseller} onChange={(e) => set("is_bestseller", e.target.checked)} /> Bestseller
            </label>
          </div>
        </div>
      </div>

      {/* Bulk gallery */}
      <div className="hairline p-6 bg-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="eyebrow">Gallery ({images.length}/10)</div>
            <p className="text-xs text-muted-foreground mt-1">Add multiple photos — customers see them on the product page.</p>
          </div>
          <label className={`btn-outline-gold cursor-pointer ${images.length >= 10 ? "opacity-50 pointer-events-none" : ""}`}>
            <ImagePlus className="h-4 w-4" /> Bulk upload
            <input type="file" multiple accept="image/*" hidden
              onChange={(e) => handleUpload(e.target.files, "gallery")} />
          </label>
        </div>
        {uploading && <div className="text-xs text-muted-foreground mb-2">Uploading…</div>}
        {images.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((im, i) => (
              <div key={i} className="relative group">
                <img src={im.image_url} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                  <button onClick={() => moveImage(i, -1)} className="bg-background/90 p-1 rounded"><GripVertical className="h-3 w-3" /></button>
                  <button onClick={() => removeImage(i)} className="bg-background/90 p-1 rounded"><X className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No gallery images yet.</div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate({ to: "/admin/products" })} className="px-4 h-11 text-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="btn-ink">
          {saving ? "Saving…" : "Save product"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="eyebrow mb-1.5">{label}</div>
      {children}
    </label>
  );
}
