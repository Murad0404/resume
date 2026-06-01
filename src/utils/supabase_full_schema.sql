-- ============================================================
-- FULL SCHEMA for murod.site
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. COURSES table (admin qo'shadigan kurslar)
CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  duration text,
  price text,
  discount_price text,
  features jsonb DEFAULT '[]'::jsonb,
  video_count integer DEFAULT 0,
  videos jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Hamma o'qiy oladi, faqat admin yoza oladi
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can write courses" ON public.courses;
CREATE POLICY "Anyone can write courses" ON public.courses FOR ALL USING (true);

-- 2. PROMPTS table
CREATE TABLE IF NOT EXISTS public.prompts (
  id text PRIMARY KEY,
  category text,
  title text NOT NULL,
  prompt text,
  image text,
  is_free boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read prompts" ON public.prompts;
CREATE POLICY "Public read prompts" ON public.prompts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can write prompts" ON public.prompts;
CREATE POLICY "Anyone can write prompts" ON public.prompts FOR ALL USING (true);

-- 3. PRICING PLANS table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id text PRIMARY KEY,
  title text NOT NULL,
  price text,
  discount_price text,
  duration text,
  features jsonb DEFAULT '[]'::jsonb,
  color text,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pricing" ON public.pricing_plans;
CREATE POLICY "Public read pricing" ON public.pricing_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can write pricing" ON public.pricing_plans;
CREATE POLICY "Anyone can write pricing" ON public.pricing_plans FOR ALL USING (true);

-- 4. CHAT MESSAGES table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id text PRIMARY KEY,
  text text NOT NULL,
  is_admin boolean DEFAULT false,
  user_id text,
  target_user_id text,
  user_name text,
  time text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read messages" ON public.chat_messages;
CREATE POLICY "Public read messages" ON public.chat_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can write messages" ON public.chat_messages;
CREATE POLICY "Anyone can write messages" ON public.chat_messages FOR ALL USING (true);

-- 5. PAYMENT REQUESTS table
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id text PRIMARY KEY,
  user_id text,
  user_name text,
  item_id text,
  item_title text,
  item_price text,
  item_type text,
  receipt_image text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read/write payment requests" ON public.payment_requests;
CREATE POLICY "Public read/write payment requests" ON public.payment_requests FOR ALL USING (true);

-- 6. VISITS table (analytics)
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert visits" ON public.visits;
CREATE POLICY "Public insert visits" ON public.visits FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read visits" ON public.visits;
CREATE POLICY "Public read visits" ON public.visits FOR SELECT USING (true);

-- ============================================================
-- SEED DATA: Default kurslar (agar bo'sh bo'lsa)
-- ============================================================
INSERT INTO public.courses (id, title, description, duration, price, discount_price, features, video_count, videos)
VALUES 
  (
    'module-1',
    '1-Modul: AI Vositalar (Amaliy)',
    'AI yordamida rasm va video generatsiya qilish, eski rasmlarni tiklash, va qaysi AI qaysi soha uchun yaxshiligi — hammasi amaliy misollar bilan.',
    '2 oy',
    '700 000 UZS',
    '500 000 UZS',
    '["🎨 AI bilan rasm generatsiya (Midjourney, DALL-E, Stable Diffusion)", "🎬 AI bilan video generatsiya (Sora, Runway, Kling)", "🖼️ Eski foto va rasmlarni AI orqali tiklash", "🤖 Qaysi AI qaysi sohada eng kuchli — taqqoslash", "💡 ChatGPT, Claude, Gemini — farqlari va foydalanish usullari"]',
    14,
    '[]'
  ),
  (
    'module-2',
    '2-Modul: AI Bilan Dasturlash & Prompting',
    'AI yordamida Frontend va Backend kod yozish, to''g''ri va optimal prompt tuzish, AI limitlarini tejab ishlash va eng foydali AI workflow strategiyalari.',
    '2 oy',
    '700 000 UZS',
    NULL,
    '["⚡ AI bilan Frontend (React, HTML/CSS) tez qurish", "🔧 AI bilan Backend (API, DB) logika yozish", "📝 To''g''ri prompt berish (Prompt Engineering asoslari)", "🔋 Limitdan samarali foydalanish — tokenni tejash usullari", "🚀 AI workflow: loyihada AI ni qanday integratsiya qilish"]',
    16,
    '[]'
  )
ON CONFLICT (id) DO NOTHING;

-- Default pricing plans
INSERT INTO public.pricing_plans (id, title, price, discount_price, duration, features, color, featured)
VALUES
  (
    'six-months',
    '6 Oylik',
    '1.50',
    NULL,
    '6 Months',
    '["Barcha promtlarga ruxsat", "Yangi promtlar qo''shilib boradi", "Texnik yordam"]',
    '#3b82f6',
    false
  ),
  (
    'lifetime',
    'Umrbod',
    '3.50',
    '2.99',
    'Lifetime',
    '["Barcha promtlarga ruxsat", "Umrbod yangilanishlar", "Texnik yordam", "Priority Support"]',
    '#8b5cf6',
    true
  )
ON CONFLICT (id) DO NOTHING;
