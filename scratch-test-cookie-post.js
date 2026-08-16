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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    const email = 'teststudent@unideal.com';
    const password = 'testpassword123';
    console.log(`Signing in as ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Auth failed:", error);
      process.exit(1);
    }

    const session = data.session;
    console.log("Auth success. Access token acquired.");

    // Extract project ref from URL
    // e.g. https://difmyugeebvbcaojcuwq.supabase.co -> difmyugeebvbcaojcuwq
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];
    const cookieName = `sb-${projectRef}-auth-token`;

    // Construct the cookie value. Supabase SSR stores the full session object encoded in base64, prefixed with 'base64-'.
    const cookieValue = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64');
    const cookieHeader = `${cookieName}=${encodeURIComponent(cookieValue)}`;

    console.log(`Sending POST /api/listings with cookie: ${cookieName}...`);

    const payload = {
      title: 'E2E Cookie Test Desk',
      description: 'This is a desk created using cookie auth fetch.',
      price: 999,
      negotiable: true,
      category_id: 3, // Furniture
      condition: 'Like New',
      images: ['https://example.com/desk.png']
    };

    const response = await fetch('http://localhost:3000/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify(payload)
    });

    const resJson = await response.json();
    console.log("POST /api/listings Response status:", response.status);
    console.log("POST /api/listings Response body:", JSON.stringify(resJson, null, 2));

    if (response.status === 201) {
      const createdListing = resJson.data;
      console.log(`\nListing created! ID: ${createdListing.id}, Slug: ${createdListing.slug}`);

      // Check if it appears in Browse Page HTML / API response
      console.log("\nChecking Browse endpoint GET /api/listings...");
      const browseResponse = await fetch('http://localhost:3000/api/listings', {
        headers: {
          'Cookie': cookieHeader
        }
      });
      const browseJson = await browseResponse.json();
      const listings = browseJson.data || [];
      const found = listings.find(l => l.id === createdListing.id);
      if (found) {
        console.log(`SUCCESS: Created listing is visible on Browse list immediately! Status: ${found.status}`);
      } else {
        console.log("FAIL: Created listing is NOT visible on Browse list.");
      }

      // Check detail page rendering
      console.log(`\nFetching detail page at http://localhost:3000/listing/${createdListing.slug}...`);
      const detailResponse = await fetch(`http://localhost:3000/listing/${createdListing.slug}`, {
        headers: {
          'Cookie': cookieHeader
        }
      });
      const detailHtml = await detailResponse.text();
      console.log("Detail page response status:", detailResponse.status);
      
      const hasTitle = detailHtml.includes('E2E Cookie Test Desk');
      const hasPrice = detailHtml.includes('999') || detailHtml.includes('₹');
      const hasSeller = detailHtml.includes('Test Student');
      const hasImage = detailHtml.includes('https://example.com/desk.png');

      console.log(`Detail page verification results:`);
      console.log(`- Contains Title: ${hasTitle ? 'PASS' : 'FAIL'}`);
      console.log(`- Contains Price/Currency: ${hasPrice ? 'PASS' : 'FAIL'}`);
      console.log(`- Contains Seller Name (Test Student): ${hasSeller ? 'PASS' : 'FAIL'}`);
      console.log(`- Contains Image URL: ${hasImage ? 'PASS' : 'FAIL'}`);

      // Clean up the created listing via Admin Client
      const supabaseAdmin = createClient(supabaseUrl, env['SUPABASE_SERVICE_ROLE_KEY']);
      await supabaseAdmin.from('listings').delete().eq('id', createdListing.id);
      console.log("\nCleanup of test listing complete.");
    }
  } catch (err) {
    console.error("Error during script execution:", err);
  }
}

run();
