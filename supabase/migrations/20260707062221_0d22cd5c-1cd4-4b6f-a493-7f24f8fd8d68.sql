
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  collection TEXT,
  short_description TEXT,
  description TEXT,
  sku TEXT,
  metal TEXT,
  purity TEXT,
  weight TEXT,
  stones TEXT[] NOT NULL DEFAULT '{}',
  dimensions TEXT,
  care_instructions TEXT,
  availability TEXT NOT NULL DEFAULT 'In Stock',
  image_url TEXT NOT NULL,
  image_alt TEXT,
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  jewelry_type TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_jewelry_type_idx ON public.products(jewelry_type);

CREATE TABLE public.inquiry_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiry_clicks TO anon, authenticated;
GRANT ALL ON public.inquiry_clicks TO service_role;
ALTER TABLE public.inquiry_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log an inquiry click" ON public.inquiry_clicks FOR INSERT WITH CHECK (true);
