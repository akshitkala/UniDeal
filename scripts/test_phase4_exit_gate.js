const { createClient } = require('@supabase/supabase-js');

async function runPhase4ExitGateTests() {
  console.log('--- STARTING PHASE 4 EXIT-GATE VERIFICATION ---');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // 1. Create Admin User
  const adminEmail = `admin_p4_${Date.now()}@campus.edu`;
  const adminPassword = 'Password123!@#';
  console.log(`\n1. Creating Admin user (${adminEmail})...`);
  const { data: adminUser, error: adminCreateErr } = await adminClient.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Admin Founder' },
  });
  if (adminCreateErr || !adminUser.user) {
    console.error('❌ Admin user creation failed:', adminCreateErr?.message);
    process.exit(1);
  }
  const adminId = adminUser.user.id;

  // Set is_admin = true on profiles
  await adminClient.from('profiles').update({ is_admin: true }).eq('id', adminId);

  const adminAuthClient = createClient(supabaseUrl, anonKey);
  const { error: adminLoginErr } = await adminAuthClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });
  if (adminLoginErr) {
    console.error('❌ Admin login failed:', adminLoginErr.message);
    process.exit(1);
  }
  console.log('✅ Admin user created & authenticated.');

  // 2. Create Regular Non-Admin Student User
  const studentEmail = `student_p4_${Date.now()}@campus.edu`;
  const studentPassword = 'Password123!@#';
  console.log(`\n2. Creating Regular Student user (${studentEmail})...`);
  const { data: studentUser, error: studentCreateErr } = await adminClient.auth.admin.createUser({
    email: studentEmail,
    password: studentPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Karan Student' },
  });
  if (studentCreateErr || !studentUser.user) {
    console.error('❌ Student user creation failed:', studentCreateErr?.message);
    process.exit(1);
  }
  const studentId = studentUser.user.id;

  const studentAuthClient = createClient(supabaseUrl, anonKey);
  const { error: studentLoginErr } = await studentAuthClient.auth.signInWithPassword({
    email: studentEmail,
    password: studentPassword,
  });
  if (studentLoginErr) {
    console.error('❌ Student login failed:', studentLoginErr.message);
    process.exit(1);
  }
  console.log('✅ Regular student user created & authenticated.');

  // 3. Verify Server-Side Admin Authorization Block on Regular Student
  console.log('\n3. Testing server-side admin guard: Non-admin trying to update admin_settings...');
  const { data: blockedSettings, error: blockedSettingsErr } = await studentAuthClient
    .from('admin_settings')
    .update({ approval_mode: 'manual' })
    .eq('id', 1)
    .select();

  if (blockedSettingsErr || !blockedSettings || blockedSettings.length === 0) {
    console.log('✅ PASS: RLS / admin guard blocked non-admin from modifying admin_settings.');
  } else {
    console.error('❌ FAIL: Non-admin was able to modify admin_settings!', blockedSettings);
    process.exit(1);
  }

  // 4. Test Approval Mode Toggle ('auto' vs 'manual')
  console.log('\n4. Testing Approval Mode toggle to manual mode...');
  await adminClient.from('admin_settings').update({ approval_mode: 'manual' }).eq('id', 1);

  // Student posts a listing while in manual mode
  const manualListingSlug = `manual-listing-${Date.now().toString().slice(-5)}`;
  const { data: pendingListing, error: pendingErr } = await studentAuthClient
    .from('listings')
    .insert({
      slug: manualListingSlug,
      seller_id: studentId,
      title: 'Manual Review Test Laptop Stand',
      description: 'Aluminum foldable laptop stand for desk ergonomics.',
      price: 600,
      negotiable: false,
      category_id: 1,
      condition: 'Good',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: 'pending', // In manual mode, status is pending
    })
    .select()
    .single();

  if (pendingErr || !pendingListing || pendingListing.status !== 'pending') {
    console.error('❌ Pending listing creation failed:', pendingErr?.message);
    process.exit(1);
  }
  console.log('✅ Listing created in manual mode with status = "pending":', pendingListing.id);

  // Verify pending listing is NOT visible in public browse
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: publicPending } = await anonClient
    .from('listings')
    .select('id')
    .eq('id', pendingListing.id);

  if (!publicPending || publicPending.length === 0) {
    console.log('✅ PASS: Pending listing is hidden from public browse automatically via RLS policy listings_select_public.');
  } else {
    console.error('❌ FAIL: Pending listing was returned in public browse!');
    process.exit(1);
  }

  // Admin approves listing
  await adminClient.from('listings').update({ status: 'approved' }).eq('id', pendingListing.id);
  console.log('✅ Admin approved listing.');

  // Reset approval_mode back to auto
  await adminClient.from('admin_settings').update({ approval_mode: 'auto' }).eq('id', 1);

  // 5. Test Banned User Listing RLS Exclusion
  console.log('\n5. Testing Banned User listing exclusion from public browse...');
  // Student now has an approved listing. Admin bans student.
  await adminClient.from('profiles').update({ is_banned: true }).eq('id', studentId);
  console.log('✅ Admin banned student user.');

  // Query public browse for approved listing of banned student
  const { data: bannedUserListings } = await anonClient
    .from('listings')
    .select('id')
    .eq('id', pendingListing.id);

  if (!bannedUserListings || bannedUserListings.length === 0) {
    console.log('✅ PASS: Banned user listing immediately disappears from public browse via RLS.');
  } else {
    console.error('❌ FAIL: Banned user listing was still visible in public browse!');
    process.exit(1);
  }

  // Verify banned student can still view their own listing on their seller dashboard (listings_select_own)
  const { data: ownDashboardListing } = await studentAuthClient
    .from('listings')
    .select('id, status')
    .eq('id', pendingListing.id)
    .single();

  if (ownDashboardListing && ownDashboardListing.id === pendingListing.id) {
    console.log('✅ PASS: Banned user can still read their own listing on their dashboard (listings_select_own).');
  } else {
    console.error('❌ FAIL: Banned user could not view their own listing on dashboard!');
    process.exit(1);
  }

  // Unban student for cleanup
  await adminClient.from('profiles').update({ is_banned: false }).eq('id', studentId);

  // 6. Test Duplicate Report Handling
  console.log('\n6. Testing Report filing & duplicate constraint (409)...');
  const { data: report1, error: report1Err } = await studentAuthClient
    .from('reports')
    .insert({
      listing_id: pendingListing.id,
      reporter_id: studentId,
      reason: 'Fake listing',
      status: 'pending',
    })
    .select()
    .single();

  if (report1Err || !report1) {
    console.error('❌ Initial report insertion failed:', report1Err?.message);
    process.exit(1);
  }
  console.log('✅ Report filed successfully by student.');

  // Attempt duplicate report
  const { error: dupReportErr } = await studentAuthClient
    .from('reports')
    .insert({
      listing_id: pendingListing.id,
      reporter_id: studentId,
      reason: 'Spam',
      status: 'pending',
    });

  if (dupReportErr && (dupReportErr.code === '23505' || dupReportErr.message.includes('unique'))) {
    console.log('✅ PASS: Duplicate report from same user blocked by DB unique constraint unique(listing_id, reporter_id).');
  } else {
    console.error('❌ FAIL: Duplicate report was not blocked!', dupReportErr);
    process.exit(1);
  }

  // 7. Cleanup
  console.log('\n7. Cleaning up Phase 4 test users & data...');
  await adminClient.auth.admin.deleteUser(adminId);
  await adminClient.auth.admin.deleteUser(studentId);
  console.log('✅ Test users deleted.');

  console.log('\n🎉 ALL PHASE 4 EXIT-GATE TESTS PASSED PERFECTLY!');
}

runPhase4ExitGateTests().catch((err) => {
  console.error('Error during exit-gate run:', err);
  process.exit(1);
});
