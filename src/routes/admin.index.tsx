import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Tags, MessageCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, c, i] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("inquiry_clicks").select("*", { count: "exact", head: true }),
      ]);
      return {
        products: p.count ?? 0,
        categories: c.count ?? 0,
        inquiries: i.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Products", value: stats?.products ?? "—", icon: Package, to: "/admin/products" },
    { label: "Categories", value: stats?.categories ?? "—", icon: Tags, to: "/admin/categories" },
    { label: "WhatsApp inquiries", value: stats?.inquiries ?? "—", icon: MessageCircle },
  ];

  return (
    <div>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="eyebrow">Overview</div>
          <h1 className="mt-2 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Dashboard
          </h1>
        </div>
        <Link to="/admin/products/new" className="btn-ink">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to as string} className="hairline p-6 bg-background hover:shadow-soft transition block">
            <c.icon className="h-5 w-5 text-[var(--gold-deep)]" />
            <div className="eyebrow mt-4">{c.label}</div>
            <div className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)" }}>{c.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
