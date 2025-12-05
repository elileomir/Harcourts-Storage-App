-- 1. Security Fix: Restrict profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 2. Create waitlist_requests table
CREATE TABLE IF NOT EXISTS public.waitlist_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    facility text NOT NULL,
    full_name text NOT NULL,
    email_address text NOT NULL,
    phone_number text NOT NULL,
    preferred_date date NOT NULL,
    storage_purpose text,
    status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Contacted', 'Offered', 'Accepted', 'Declined', 'Expired')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for waitlist_requests
ALTER TABLE public.waitlist_requests ENABLE ROW LEVEL SECURITY;

-- Broad write access as requested (Authenticated users can do everything)
CREATE POLICY "Allow all for authenticated users" ON public.waitlist_requests
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER waitlist_requests_updated_at
    BEFORE UPDATE ON public.waitlist_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3. Update callback_requests
ALTER TABLE public.callback_requests 
ADD COLUMN IF NOT EXISTS notes text;
