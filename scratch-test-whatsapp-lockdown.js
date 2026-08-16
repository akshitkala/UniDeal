const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials in .env.local");
  process.exit(1);
}

const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);

async function checkWhatsappLockdown() {
  try {
    const email = 'teststudent@unideal.com';
    console.log(`Signing in as authenticated user: ${email}...`);
    
    const { data: signInData, error: signInError } = await supabaseUser.auth.signInWithPassword({
      email,
      password: 'testpassword123'
    });

    if (signInError) {
      console.error("Sign in failed:", signInError);
      process.exit(1);
    }
    
    console.log("Sign in successful.\n");

    // 1. Querying profiles with SELECT '*'
    console.log("--- QUERY 1: select('*') ---");
    const { data: selectAllData, error: selectAllError } = await supabaseUser
      .from('profiles')
      .select('*');

    console.log("Data:", JSON.stringify(selectAllData, null, 2));
    console.log("Error:", selectAllError);

    // 2. Querying profiles with SELECT 'whatsapp_number'
    console.log("\n--- QUERY 2: select('whatsapp_number') ---");
    const { data: selectColData, error: selectColError } = await supabaseUser
      .from('profiles')
      .select('whatsapp_number');

    console.log("Data:", JSON.stringify(selectColData, null, 2));
    console.log("Error:", selectColError);

    // 3. Querying profiles with SELECT allowed columns only
    console.log("\n--- QUERY 3: select('id, full_name') ---");
    const { data: selectAllowedData, error: selectAllowedError } = await supabaseUser
      .from('profiles')
      .select('id, full_name');

    console.log("Data:", JSON.stringify(selectAllData, null, 2)); // wait, selectAllData is null, let's log selectAllowedData
    console.log("Data:", JSON.stringify(selectAllData, null, 2));
    console.log("Allowed Data:", JSON.stringify(selectAllowedData, null, 2));
    console.log("Error:", selectAllowedError);

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

checkWhatsappLockdown();
