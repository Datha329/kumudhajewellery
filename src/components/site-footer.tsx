import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";
import { NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-secondary/30">
      <div className="container-luxe py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex flex-col leading-none">
            <span className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              Kumudha
            </span>
            <span className="eyebrow mt-1">Jewelry</span>
          </div>
          <p className="mt-6 max-w-md text-sm text-muted-foreground leading-relaxed">
            A digital showroom of heirloom-quality gold, diamond, and temple
            jewelry. Every piece is hand-finished by our master artisans.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={SITE.instagram}
              aria-label="Instagram"
              className="h-10 w-10 border border-border grid place-items-center hover:border-[var(--gold-deep)] transition"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={SITE.facebook}
              aria-label="Facebook"
              className="h-10 w-10 border border-border grid place-items-center hover:border-[var(--gold-deep)] transition"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="eyebrow">Explore</div>
          <ul className="mt-4 space-y-3 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-[var(--gold-deep)] transition">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="eyebrow">Visit &amp; Inquire</div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="text-foreground">{SITE.whatsappDisplay}</li>
            <li>{SITE.email}</li>
            <li>{SITE.hours}</li>
            <li>{SITE.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Kumudha Jewelry. All rights reserved.</span>
          <span className="eyebrow">Crafted with devotion</span>
        </div>
      </div>
    </footer>
  );
}
