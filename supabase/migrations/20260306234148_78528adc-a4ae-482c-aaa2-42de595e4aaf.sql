
-- Add phone to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Create addresses table
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  street text NOT NULL DEFAULT '',
  number text NOT NULL DEFAULT '',
  neighborhood text NOT NULL DEFAULT '',
  complement text,
  city text NOT NULL DEFAULT '',
  is_default boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow users to insert their own profiles (for signup flow)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
