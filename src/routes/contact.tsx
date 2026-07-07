import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { SITE } from "@/lib/site";
import { buildInquiryUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Kumudha Jewelry" },
      {
        name: "description",
        content:
          "Reach Kumudha Jewelry on WhatsApp or visit our boutique. We reply personally to every inquiry.",
      },
      { property: "og:title", content: "Contact Kumudha Jewelry" },
      { property: "og:description", content: "WhatsApp, email and boutique hours." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="container-luxe pt-12 md:pt-20 pb-24">
      <div className="text-center max-w-2xl mx-auto">
        <div className="eyebrow">Get in touch</div>
        <h1 className="mt-3 text-4xl md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          We reply to every message
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The fastest way to reach us is on WhatsApp. Message us about a specific
          piece, a custom design, or to book a boutique appointment.
        </p>
        <div className="mt-8">
          <a href={buildInquiryUrl({ message: "Hello Kumudha Jewelry, I'd like to know more." })}
             target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
        <div className="gold-rule mt-10 max-w-[80px] mx-auto" />
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <Card icon={MessageCircle} title="WhatsApp" body={SITE.whatsappDisplay} />
        <Card icon={Mail} title="Email" body={SITE.email} />
        <Card icon={Clock} title="Hours" body={SITE.hours} />
        <div className="md:col-span-3">
          <div className="hairline p-8 md:p-10 grid md:grid-cols-[auto_1fr] gap-6 items-start bg-secondary/30">
            <MapPin className="h-5 w-5 text-[var(--gold-deep)] mt-1" />
            <div>
              <div className="eyebrow">Visit</div>
              <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                {SITE.address}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Boutique visits are by appointment. Message us on WhatsApp to schedule.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="hairline p-8 text-center bg-card">
      <Icon className="h-5 w-5 mx-auto text-[var(--gold-deep)]" />
      <div className="mt-4 eyebrow">{title}</div>
      <div className="mt-2 text-sm">{body}</div>
    </div>
  );
}
