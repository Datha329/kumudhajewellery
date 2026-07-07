import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-luxe flex h-20 items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span
            className="text-xl md:text-2xl tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Kumudha
          </span>
          <span className="eyebrow mt-0.5">Jewelry</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[13px] tracking-[0.16em] uppercase text-foreground/75 transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:[text-decoration:underline] data-[status=active]:underline-offset-8 data-[status=active]:decoration-1"
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            aria-label="Visual search"
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent hover:border-border transition"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-luxe flex flex-col py-6 gap-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm tracking-[0.18em] uppercase py-2"
              >
                {item.label}
              </Link>
            ))}
            <p className="mt-4 text-xs text-muted-foreground">{SITE.whatsappDisplay}</p>
          </nav>
        </div>
      )}
    </header>
  );
}
