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
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("Missing credentials in .env.local");
  process.exit(1);
}

// User Client (authenticated as teststudent@unideal.com)
const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);
// Admin Client (service role, bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  try {
    const email = 'teststudent@unideal.com';
    console.log(`Signing in as non-admin user: ${email}...`);
    
    const { data: signInData, error: signInError } = await supabaseUser.auth.signInWithPassword({
      email,
      password: 'testpassword123'
    });

    if (signInError) {
      console.error("Sign in failed:", signInError);
      process.exit(1);
    }
    
    const userId = signInData.user.id;
    console.log(`Sign in successful. User ID: ${userId}`);

    // Check user is_admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    console.log(`User profile is_admin: ${profile?.is_admin} (Expected: false)`);

    // 1. Try to read admin_settings as the non-admin user directly (Should FAIL due to settings_select_admin policy)
    console.log("\n1. Attempting: select approval_mode from admin_settings using USER client...");
    const { data: userSettings, error: userSettingsError } = await supabaseUser
      .from('admin_settings')
      .select('approval_mode')
      .eq('id', 1)
      .single();

    if (userSettingsError) {
      console.log(`Result: Query failed (Expected behaviour due to RLS on admin_settings):`);
      console.log(`Error code: ${userSettingsError.code}`);
      console.log(`Error message: ${userSettingsError.message}`);
    } else {
      console.log("Result: Query succeeded! (Unexpected: admin_settings RLS is missing/bypassed):", userSettings);
    }

    // 2. Read admin_settings using the ADMIN service-role client (Should SUCCEED)
    console.log("\n2. Attempting: select approval_mode from admin_settings using ADMIN service-role client...");
    const { data: adminSettings, error: adminSettingsError } = await supabaseAdmin
      .from('admin_settings')
      .select('approval_mode')
      .eq('id', 1)
      .single();

    if (adminSettingsError) {
      console.error("Result: Service-role query failed:", adminSettingsError);
    } else {
      console.log("Result: Service-role query succeeded! Approval mode:", adminSettings.approval_mode);
    }

    // 3. Insert a test listing as the non-admin user (Should SUCCEED because user is verified and not banned)
    console.log("\n3. Attempting to insert a listing using the USER client...");
    
    // Cleanup any existing test listings with this specific title first to avoid duplicates
    await supabaseAdmin.from('listings').delete().eq('title', 'Refactoring Test Item');

    const testListing = {
      slug: `refactoring-test-item-${Math.floor(Math.random() * 10000)}`,
      seller_id: userId,
      title: 'Refactoring Test Item',
      description: 'This is a test description for RLS validation.',
      price: 150.00,
      negotiable: true,
      category_id: 1, // Books & Notes
      condition: 'Good',
      images: ['https://example.com/test.jpg'],
      status: adminSettings.approval_mode === 'auto' ? 'approved' : 'pending'
    };

    const { data: createdListing, error: insertError } = await supabaseUser
      .from('listings')
      .insert(testListing)
      .select()
      .single();

    if (insertError) {
      console.error("Result: Insert failed:", insertError);
    } else {
      console.log("Result: Insert succeeded! Created listing detail:");
      console.log(`- ID: ${createdListing.id}`);
      console.log(`- Slug: ${createdListing.slug}`);
      console.log(`- Status: ${createdListing.status}`);
      
      // Cleanup after test
      await supabaseAdmin.from('listings').delete().eq('id', createdListing.id);
      console.log("\nVerification complete. Cleaned up test listing.");
    }

  } catch (err) {
    console.error("Unexpected error during test execution:", err);
  }
}

test();
