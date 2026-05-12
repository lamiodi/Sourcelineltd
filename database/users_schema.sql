-- Create a custom users table for manual auth
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Will store bcrypt hash
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We are NOT using Supabase Auth (auth.users). 
-- We are managing this table manually via our Node.js server.
