const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables - hybrid approach
// 1. Load root .env first (shared variables)
dotenv.config({ path: '../../../.env' });
// 2. Load package-specific .env (overrides root .env if exists)
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using empty clients');
}

// Client for general operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for service operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = {
  supabase,
  supabaseAdmin
};
