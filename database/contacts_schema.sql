-- Create a table for contact form submissions
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows insert for everyone (public)
CREATE POLICY "Enable insert for all users" ON contacts
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows select/delete only for authenticated users (admins)
CREATE POLICY "Enable read for authenticated users only" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON contacts
  FOR DELETE USING (auth.role() = 'authenticated');
