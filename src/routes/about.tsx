import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-necklace.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kumudha Jewelry" },
      {
        name: "description",
        content:
          "The story behind Kumudha Jewelry — an atelier of temple, bridal and diamond jewelry, hand-finished by master artisans.",
      },
      { property: "og:title", content: "About Kumudha Jewelry" },
      {
        property: "og:description",
        content: "An atelier of heirloom-quality gold, diamond and temple jewelry.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="container-luxe pt-12 md:pt-20 pb-16">
        <div className="max-w-2xl">
          <div className="eyebrow">Our story</div>
          <h1 className="mt-4 text-4xl md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            An atelier of <em className="gold-shimmer not-italic">devotion</em>.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            Kumudha Jewelry began as a family workshop and grew into a house
            defined by patience. Every piece we make starts with a sketch, moves
            through the hands of our artisans, and ends only when it is worthy
            of being worn on the most important days of a life.
          </p>
        </div>
      </section>

      <section className="container-luxe grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] overflow-hidden hairline">
          <img src={heroImage} alt="Kumudha Jewelry craftsmanship" width={1600} height={1200} className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="eyebrow">Craftsmanship</div>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Slow-made, by hand.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Our master artisans work in the traditions of South Indian temple
            jewelry and modern diamond craft. From the first wax carving to the
            last polish, each ornament passes through a dozen pairs of hands —
            and every hand adds a little of its own care.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <Pillar title="Design" body="Every piece begins with a sketch that honors both tradition and the wearer." />
            <Pillar title="Metal" body="22k and 18k gold, BIS-hallmarked, sourced from certified refiners." />
            <Pillar title="Stones" body="Ethically sourced diamonds, rubies, emeralds and freshwater pearls." />
            <Pillar title="Finishing" body="Hand-polished to a mirror finish. Set, checked and quality-graded." />
          </div>
        </div>
      </section>

      <section className="container-luxe mt-24">
        <div className="hairline bg-[var(--ink)] text-[var(--cream)] px-8 py-14 md:py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>Vision</div>
              <p className="mt-3 text-lg leading-relaxed">
                To keep alive the craft of heirloom Indian jewelry for a new generation.
              </p>
            </div>
            <div>
              <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>Mission</div>
              <p className="mt-3 text-lg leading-relaxed">
                Make every ornament worth passing down — in purity, in design, and in story.
              </p>
            </div>
            <div>
              <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>Promise</div>
              <p className="mt-3 text-lg leading-relaxed">
                Hallmarked purity, honest weight, and a lifetime of care with every piece.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe mt-24 text-center">
        <Link to="/collections" className="btn-ink">Explore the collection</Link>
      </section>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
