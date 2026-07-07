import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/product-form";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProduct,
});

function NewProduct() {
  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-4 text-3xl" style={{ fontFamily: "var(--font-display)" }}>New product</h1>
      <p className="mt-1 text-sm text-muted-foreground">Fill in the details below and add up to 10 photos.</p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
