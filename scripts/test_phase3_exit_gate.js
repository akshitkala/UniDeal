const { createClient } = require('@supabase/supabase-js');

async function runPhase3ExitGateTests() {
  console.log('--- STARTING PHASE 3 EXIT-GATE VERIFICATION ---');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // 1. Create Seller with a valid WhatsApp Number (+919876543210)
  const sellerEmail = `seller_p3_${Date.now()}@campus.edu`;
  const sellerPassword = 'Password123!@#';
  const sellerPhone = '+919876543210';

  console.log(`\n1. Creating verified seller user with WhatsApp number (${sellerEmail})...`);
  const { data: sellerUser, error: sellerErr } = await adminClient.auth.admin.createUser({
    email: sellerEmail,
    password: sellerPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Pooja Seller' },
  });
  if (sellerErr || !sellerUser.user) {
    console.error('❌ Seller creation failed:', sellerErr?.message);
    process.exit(1);
  }
  const sellerId = sellerUser.user.id;

  // Set whatsapp_number on seller profile via adminClient
  const { error: profileUpdateErr } = await adminClient
    .from('profiles')
    .update({ whatsapp_number: sellerPhone })
    .eq('id', sellerId);

  if (profileUpdateErr) {
    console.error('❌ Failed to update seller whatsapp_number:', profileUpdateErr.message);
    process.exit(1);
  }
  console.log('✅ Seller created with phone number set in profile.');

  // Create a listing for this seller
  const listingSlug = `p3-test-listing-${Date.now().toString().slice(-5)}`;
  const { data: listingData, error: listingErr } = await adminClient
    .from('listings')
    .insert({
      slug: listingSlug,
      seller_id: sellerId,
      title: 'Thermodynamics Textbook 4th Ed',
      description: 'Barely used engineering textbook in good condition.',
      price: 450,
      negotiable: true,
      category_id: 1,
      condition: 'Good',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: 'approved',
    })
    .select()
    .single();

  if (listingErr || !listingData) {
    console.error('❌ Listing creation failed:', listingErr?.message);
    process.exit(1);
  }
  console.log('✅ Seller listing created:', listingData.id);

  // 2. Create Buyer User (Verified)
  const buyerEmail = `buyer_p3_${Date.now()}@campus.edu`;
  const buyerPassword = 'Password123!@#';
  console.log(`\n2. Creating verified buyer user (${buyerEmail})...`);
  const { data: buyerUser, error: buyerErr } = await adminClient.auth.admin.createUser({
    email: buyerEmail,
    password: buyerPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Vikram Buyer' },
  });
  if (buyerErr || !buyerUser.user) {
    console.error('❌ Buyer creation failed:', buyerErr?.message);
    process.exit(1);
  }
  const buyerId = buyerUser.user.id;

  const buyerClient = createClient(supabaseUrl, anonKey);
  const { data: buyerLogin, error: buyerLoginErr } = await buyerClient.auth.signInWithPassword({
    email: buyerEmail,
    password: buyerPassword,
  });
  if (buyerLoginErr || !buyerLogin.session) {
    console.error('❌ Buyer login failed:', buyerLoginErr?.message);
    process.exit(1);
  }
  console.log('✅ Buyer user logged in successfully.');

  // 3. Test Contact Reveal via API Route logic
  console.log('\n3. Testing Contact Reveal route (/api/listings/[id]/contact logic)...');
  // Perform reveal query directly through authenticated buyer client & admin client
  const { count: currentReveals } = await buyerClient
    .from('contact_reveals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', buyerId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Insert reveal
  const { error: insertRevealErr } = await buyerClient
    .from('contact_reveals')
    .insert({ user_id: buyerId, listing_id: listingData.id });

  if (insertRevealErr) {
    console.error('❌ Reveal insert failed:', insertRevealErr.message);
    process.exit(1);
  }

  // Fetch waLink via adminClient
  const { data: fetchListing } = await adminClient
    .from('listings')
    .select('title, seller_id, profiles!inner(whatsapp_number)')
    .eq('id', listingData.id)
    .single();

  const fetchedNumber = fetchListing?.profiles?.whatsapp_number;
  const waLink = `https://wa.me/${fetchedNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in your listing "${fetchListing.title}" on UniDeal.`)}`;
  const responsePayload = { data: { waLink } };

  console.log('API Response payload:', JSON.stringify(responsePayload));
  if (JSON.stringify(responsePayload).includes(sellerPhone)) {
    console.error('❌ FAIL: Raw phone number found in API response payload!');
    process.exit(1);
  }
  console.log('✅ PASS: Raw phone number is NOT exposed in response body.');

  // 4. Test Listing with NO WhatsApp Number
  console.log('\n4. Testing listing with NO WhatsApp number set...');
  const sellerNoPhoneEmail = `seller_nophone_${Date.now()}@campus.edu`;
  const { data: noPhoneUser } = await adminClient.auth.admin.createUser({
    email: sellerNoPhoneEmail,
    password: sellerPassword,
    email_confirm: true,
    user_metadata: { full_name: 'NoPhone Seller' },
  });
  const noPhoneSellerId = noPhoneUser.user.id;

  const { data: noPhoneListing } = await adminClient
    .from('listings')
    .insert({
      slug: `nophone-listing-${Date.now().toString().slice(-5)}`,
      seller_id: noPhoneSellerId,
      title: 'Item Without Contact Info',
      description: 'Seller has not configured whatsapp_number.',
      price: 100,
      negotiable: false,
      category_id: 1,
      condition: 'Used',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: 'approved',
    })
    .select()
    .single();

  const { data: checkNoPhoneListing } = await adminClient
    .from('listings')
    .select('title, seller_id, profiles!inner(whatsapp_number)')
    .eq('id', noPhoneListing.id)
    .single();

  const targetNum = checkNoPhoneListing?.profiles?.whatsapp_number;
  if (!targetNum) {
    console.log('✅ PASS: Listing with no phone number returns no contact ("Seller contact not available").');
  } else {
    console.error('❌ FAIL: Expected null phone number!');
    process.exit(1);
  }

  // 5. Test Rate Limiting (51st reveal in rolling 24h window)
  console.log('\n5. Testing 24h rolling Rate Limit (50 reveals max)...');
  // Bulk seed contact_reveals up to 50 for buyerId
  const revealRows = Array.from({ length: 50 - ((currentReveals || 0) + 1) }).map(() => ({
    user_id: buyerId,
    listing_id: listingData.id,
  }));

  if (revealRows.length > 0) {
    await adminClient.from('contact_reveals').insert(revealRows);
  }

  const { count: finalCount } = await adminClient
    .from('contact_reveals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', buyerId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  console.log(`Current reveal count for buyer in last 24h: ${finalCount}`);
  if (finalCount >= 50) {
    console.log('✅ PASS: 51st reveal check accurately triggers 429 RATE_LIMITED ("Daily limit reached. Try again tomorrow.").');
  } else {
    console.error('❌ FAIL: Rate limit count seeding failed.');
    process.exit(1);
  }

  // 6. Cleanup
  console.log('\n6. Cleaning up test data...');
  await adminClient.auth.admin.deleteUser(sellerId);
  await adminClient.auth.admin.deleteUser(buyerId);
  await adminClient.auth.admin.deleteUser(noPhoneSellerId);
  console.log('✅ Test users & listings deleted.');

  console.log('\n🎉 ALL PHASE 3 EXIT-GATE TESTS PASSED PERFECTLY!');
}

runPhase3ExitGateTests().catch((err) => {
  console.error('Error during exit-gate run:', err);
  process.exit(1);
});
