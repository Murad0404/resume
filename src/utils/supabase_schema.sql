-- 1. Create a table for student profiles
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 2. Create a trigger to map auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Purchases table
CREATE TABLE public.purchases (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'active'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Messages (Chat) table
CREATE TABLE public.course_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. RLS (Row Level Security) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
-- In a real app, only admin or webhook can insert active purchases. We allow insert for simulating payment flow
CREATE POLICY "Users can insert purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own messages" ON public.course_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert messages" ON public.course_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
