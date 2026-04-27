-- Letters table
CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  mood TEXT,
  deliver_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_letters_status_deliver_at ON public.letters (status, deliver_at);

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a letter (anonymous app)
CREATE POLICY "Anyone can insert letters"
  ON public.letters
  FOR INSERT
  WITH CHECK (true);

-- No client-side reads/updates/deletes. Edge functions use service role.

-- Secret access table
CREATE TABLE public.secret_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.secret_access ENABLE ROW LEVEL SECURITY;
-- No policies = fully locked down. Only service role can access.