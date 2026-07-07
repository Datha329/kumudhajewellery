import { SITE } from "./site";

export function buildInquiryUrl(opts: { name?: string; sku?: string; message?: string }) {
  const lines = [
    "Hello Kumudha Jewelry,",
    "",
    "I'm interested in this piece.",
  ];
  if (opts.name) lines.push(`Product: ${opts.name}`);
  if (opts.sku) lines.push(`Code: ${opts.sku}`);
  lines.push("", "Please share the price and availability.", "", "Thank you.");
  const text = opts.message ?? lines.join("\n");
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
