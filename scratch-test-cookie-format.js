const { createServerClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const index = trimmed.indexOf('=');
  if (index !== -1) {
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    env[key] = value;
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = 'teststudent@unideal.com';
  const password = 'testpassword123';
  const { data } = await supabase.auth.signInWithPassword({ email, password });
  const session = data.session;

  const cookiesSaved = [];
  const sSsr = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return []; },
      setAll(cookiesToSet) {
        cookiesSaved.push(...cookiesToSet);
      }
    }
  });

  await sSsr.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });

  console.log("Cookies set by @supabase/ssr:");
  console.log(JSON.stringify(cookiesSaved, null, 2));
}

run();
