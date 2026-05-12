
-- Create a table for newsletter subscribers
CREATE TABLE subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security (RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows insert for everyone (public subscription)
CREATE POLICY "Enable insert for all users" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows read access only for authenticated users (admins)
CREATE POLICY "Enable read access for authenticated users only" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');
