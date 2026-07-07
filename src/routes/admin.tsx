import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LayoutDashboard, Package, Tags, LogOut, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useIsAdmin } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Kumudha Jewelry" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { session, user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);

  if (loading) return <FullScreen>Loading…</FullScreen>;
  if (!session) return <LoginScreen />;
  if (roleLoading) return <FullScreen>Verifying access…</FullScreen>;
  if (!isAdmin) return <AccessDenied email={user?.email ?? ""} />;

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}

function AdminSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/products", label: "Products", icon: Package },
  ];
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-background min-h-screen p-6 hidden md:flex md:flex-col">
      <Link to="/admin" className="flex flex-col leading-none mb-10">
        <span className="text-lg" style={{ fontFamily: "var(--font-display)" }}>Kumudha</span>
        <span className="eyebrow mt-0.5">Admin</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition ${
                active ? "bg-[var(--ink)] text-[var(--cream)]" : "hover:bg-secondary"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-border">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Signed out");
          }}
          className="flex items-center gap-3 px-3 py-2.5 text-sm w-full hover:bg-secondary rounded-md"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">{children}</div>;
}

function AccessDenied({ email }: { email: string }) {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="max-w-md text-center hairline p-10 bg-background">
        <ShieldAlert className="h-8 w-8 mx-auto text-[var(--gold-deep)]" />
        <h1 className="mt-4 text-2xl" style={{ fontFamily: "var(--font-display)" }}>Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The signed-in account <strong>{email}</strong> is not authorized to view this dashboard.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="btn-outline-gold mt-6"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/30 px-6">
      <div className="w-full max-w-sm bg-background hairline p-8">
        <div className="text-center">
          <div className="eyebrow">Kumudha</div>
          <h1 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Admin sign in
          </h1>
        </div>

        <button
          onClick={google}
          className="mt-8 w-full h-11 border border-border hover:bg-secondary rounded-md text-sm flex items-center justify-center gap-2"
        >
          <GoogleGlyph /> Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 border border-border rounded-md text-sm bg-background"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-3 border border-border rounded-md text-sm bg-background"
          />
          <button type="submit" disabled={busy} className="btn-ink w-full justify-center">
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
      <Toaster />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.5-4.1 7.1-10.2 7.1-17.6z"/>
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.2-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}
