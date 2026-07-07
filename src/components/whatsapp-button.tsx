import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildInquiryUrl } from "@/lib/whatsapp";

type Props = {
  productId?: string;
  productName?: string;
  sku?: string | null;
  source?: string;
  label?: string;
  className?: string;
};

export function WhatsAppButton({ productId, productName, sku, source, label = "Inquire on WhatsApp", className }: Props) {
  async function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (productId) {
      // Fire-and-forget — never block the user.
      void supabase
        .from("inquiry_clicks")
        .insert({ product_id: productId, source: source ?? "product" });
    }
    const url = buildInquiryUrl({ name: productName, sku: sku ?? undefined });
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return (
    <a
      href={buildInquiryUrl({ name: productName, sku: sku ?? undefined })}
      onClick={onClick}
      className={className ?? "btn-whatsapp"}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
