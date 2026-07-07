import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function CategoriesPage() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function startNew() {
    setEditing({ id: "", name: "", slug: "", description: "", sort_order: 0, created_at: "" } as Category);
    setName("");
    setDescription("");
  }
  function startEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setDescription(c.description ?? "");
  }

  async function save() {
    if (!editing) return;
    const payload = { name, description, slug: editing.slug || slugify(name) };
    if (!payload.name) return toast.error("Name required");
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("categories").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("categories").insert(payload));
    }
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function del(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="eyebrow">Manage</div>
          <h1 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)" }}>Categories</h1>
        </div>
        <button onClick={startNew} className="btn-ink"><Plus className="h-4 w-4" /> New category</button>
      </div>

      <div className="mt-8 hairline bg-background divide-y divide-border">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground truncate">{c.description}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{c.slug}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(c)} className="p-2 hover:bg-secondary rounded"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(c)} className="p-2 hover:bg-secondary rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {!categories.length && <div className="p-6 text-sm text-muted-foreground">No categories yet.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-background hairline p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
              {editing.id ? "Edit" : "New"} category
            </h2>
            <div className="mt-6 space-y-3">
              <label className="block text-xs eyebrow">Name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Necklaces"
                  className="mt-1 w-full h-11 px-3 border border-border rounded-md text-sm" />
              </label>
              <label className="block text-xs eyebrow">Description
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="mt-1 w-full p-3 border border-border rounded-md text-sm" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 h-10 text-sm">Cancel</button>
              <button onClick={save} className="btn-ink">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
