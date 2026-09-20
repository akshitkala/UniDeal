const { createClient } = require('@supabase/supabase-js');

async function runExitGateTests() {
  console.log('--- STARTING PHASE 1 EXIT-GATE VERIFICATION ---');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const anonClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const testEmail = `test_student_${Date.now()}@campus.edu`;
  const testPassword = 'Password123!@#';
  const testFullName = 'Akshit TestStudent';

  console.log(`\n1. Creating User via Admin API (${testEmail})...`);
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: false,
    user_metadata: {
      full_name: testFullName,
    },
  });

  if (createError || !userData.user) {
    console.error('❌ User creation failed:', createError?.message);
    process.exit(1);
  }

  const userId = userData.user.id;
  console.log('✅ User registered successfully. ID:', userId);

  console.log('\n2. Verifying trigger handle_new_user auto-created public.profiles row...');
  const { data: profileData, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profileData) {
    console.error('❌ Profile creation verification failed:', profileError?.message);
    process.exit(1);
  }
  console.log('✅ Profile exists:', {
    id: profileData.id,
    full_name: profileData.full_name,
    is_admin: profileData.is_admin,
    is_banned: profileData.is_banned,
  });

  if (profileData.full_name !== testFullName) {
    console.error(`❌ Expected full_name to be "${testFullName}", got "${profileData.full_name}"`);
    process.exit(1);
  }
  console.log('✅ Trigger correctly populated full_name from metadata.');

  console.log('\n3. Simulating email confirmation (setting email_confirmed_at)...');
  const { data: updatedUser, error: confirmError } = await adminClient.auth.admin.updateUserById(
    userId,
    { email_confirm: true }
  );

  if (confirmError) {
    console.error('❌ Failed to confirm user email:', confirmError.message);
    process.exit(1);
  }
  console.log('✅ Email confirmed at:', updatedUser.user.email_confirmed_at);

  console.log('\n4. Testing login with confirmed credentials...');
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('❌ Login failed:', signInError.message);
    process.exit(1);
  }
  console.log('✅ Logged in successfully. Authenticated user session active.');

  console.log('\n5. Testing RLS Column Lockdown: Attempting select(whatsapp_number) on profiles as authenticated client...');
  const { data: secretData, error: secretError } = await anonClient
    .from('profiles')
    .select('whatsapp_number')
    .eq('id', userId);

  console.log('Query result:', { data: secretData, error: secretError?.message });
  if (secretError && secretError.message.includes('permission denied')) {
    console.log('✅ PASS: Authenticated client cannot select whatsapp_number (Postgres column-level permission denied as designed).');
  } else {
    console.error('❌ FAIL: whatsapp_number was not blocked!');
    process.exit(1);
  }

  console.log('\n6. Testing allowed column read on public_profiles view as guest/anon...');
  const guestClient = createClient(supabaseUrl, anonKey);
  const { data: publicViewData, error: publicViewError } = await guestClient
    .from('public_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (publicViewError || !publicViewData) {
    console.error('❌ public_profiles query failed:', publicViewError?.message);
    process.exit(1);
  }

  console.log('✅ public_profiles view output:', publicViewData);
  if ('whatsapp_number' in publicViewData) {
    console.error('❌ FAIL: whatsapp_number found in public_profiles!');
    process.exit(1);
  }
  console.log('✅ PASS: public_profiles does not contain whatsapp_number.');

  console.log('\n7. Cleaning up test user...');
  await adminClient.auth.admin.deleteUser(userId);
  console.log('✅ Test user cleaned up.');

  console.log('\n🎉 ALL PHASE 1 EXIT-GATE TESTS PASSED PERFECTLY!');
}

runExitGateTests().catch((err) => {
  console.error('Error during exit-gate run:', err);
  process.exit(1);
});
