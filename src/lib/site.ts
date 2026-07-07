export const SITE = {
  name: "Kumudha Jewelry",
  tagline: "Heirloom craftsmanship, timeless design",
  description:
    "A digital showroom of hand-crafted gold, diamond, temple and bridal jewelry from Kumudha Jewelry. Browse our collections and inquire on WhatsApp.",
  whatsappNumber: "917842536834", // +91 78425 36834 in wa.me format
  whatsappDisplay: "+91 78425 36834",
  email: "hello@kumudhajewelry.com",
  address: "Kumudha Jewelry Boutique, India",
  hours: "Mon – Sat · 10:30 AM – 8:30 PM",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
} as const;

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/search", label: "Visual Search" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
