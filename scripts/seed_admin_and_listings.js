/**
 * seed_admin_and_listings.js
 * - Promotes akshitkala72@gmail.com to admin
 * - Seeds dummy listings across all 6 categories using a verified seed user
 *
 * Run: node scripts/seed_admin_and_listings.js
 * (reads .env.local manually — no dotenv dependency needed)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const ADMIN_EMAIL = 'akshitkala72@gmail.com';

// Dummy listings — 3 per category (18 total)
const DUMMY_LISTINGS = [
  // Books & Notes (category_id: 1)
  { title: 'Engineering Mathematics Textbook', description: 'RD Sharma Engineering Maths Vol 1 & 2. Used for 2 semesters, good condition, all pages intact. Perfect for 1st year students.', price: 280, negotiable: true, category_id: 1, condition: 'Good', images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'] },
  { title: 'Physics Lab Manual + Theory Notes', description: 'Comprehensive handwritten notes for Physics practicals. Includes all experiments with observations and conclusions. Saved me hours.', price: 120, negotiable: false, category_id: 1, condition: 'Like New', images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'] },
  { title: 'Data Structures & Algorithms Book', description: 'Cormen CLRS — Introduction to Algorithms, 3rd Edition. A few highlights in chapter 1-5, rest pristine. Essential for placements.', price: 450, negotiable: true, category_id: 1, condition: 'Used', images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80'] },

  // Electronics (category_id: 2)
  { title: 'boAt Rockerz 450 Bluetooth Headphones', description: 'Used for 8 months. Works perfectly, sound quality great. Selling because upgrading to Sony. Comes with original cable and pouch.', price: 950, negotiable: true, category_id: 2, condition: 'Good', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'] },
  { title: 'Laptop Cooling Pad — Havit HV-F2056', description: 'Used for 1 year. All 3 fans work. Some scratches on bottom but top surface clean. Good for gaming laptops or intense coding sessions.', price: 400, negotiable: false, category_id: 2, condition: 'Good', images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'] },
  { title: 'USB-C Hub 7-in-1 (HDMI, USB 3.0, SD Card)', description: 'Brand new, never used. Got it as a gift but already have one. Compatible with MacBook, Dell XPS, and most USB-C laptops.', price: 750, negotiable: true, category_id: 2, condition: 'New', images: ['https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80'] },

  // Furniture (category_id: 3)
  { title: 'Study Table with Shelf — Wooden', description: 'Solid wood study table, 4 ft wide with an overhead shelf. Slight scuff on one leg. Fits comfortably in a single hostel room. Self-pickup only.', price: 1800, negotiable: true, category_id: 3, condition: 'Used', images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80'] },
  { title: 'Folding Chair — Plastic', description: 'Simple plastic folding chair. Fully functional, no cracks. Great for guests or as an extra seat. Lightweight and easy to store.', price: 200, negotiable: false, category_id: 3, condition: 'Used', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'] },
  { title: 'Mini Bookshelf — 3 Tier', description: 'Small 3-shelf bookcase, fits about 40 books. Paint slightly chipped on top. Ideal for a hostel room desk corner.', price: 600, negotiable: true, category_id: 3, condition: 'Good', images: ['https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80'] },

  // Clothing (category_id: 4)
  { title: 'Campus Sweatshirt (M) — Navy Blue', description: 'Official college sweatshirt, size M. Worn 3-4 times. Washed gently, no fading or pilling. Great quality fleece inside.', price: 350, negotiable: false, category_id: 4, condition: 'Like New', images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'] },
  { title: 'Nike Running Shoes — Size 9', description: 'White Nike Revolution 6. Used for about 4 months for morning jogs. Still lots of sole left, cleaned before listing. No box.', price: 1200, negotiable: true, category_id: 4, condition: 'Good', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'] },
  { title: 'Formal Shirt Bundle — 3 Shirts (L)', description: 'Three formal shirts (white, light blue, grey stripes). Size L. Used for internship interviews, dry-cleaned. Perfect for placements season.', price: 700, negotiable: true, category_id: 4, condition: 'Like New', images: ['https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=600&q=80'] },

  // Sports & Fitness (category_id: 5)
  { title: 'Cosco Cricket Kit — Full Set', description: 'Complete cricket kit: bat (english willow), pads, gloves, helmet, guard. Used for 1 season. Bat has some ball marks but performance not affected.', price: 2500, negotiable: true, category_id: 5, condition: 'Good', images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80'] },
  { title: 'Resistance Bands Set (5 levels)', description: 'Full set of 5 resistance bands, different tensions. Used about 10 times. Great for home workouts, no gym needed. Comes with door anchor and handles.', price: 380, negotiable: false, category_id: 5, condition: 'Like New', images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80'] },
  { title: 'Badminton Racket Pair + Shuttlecocks', description: 'Two Yonex rackets (GR-303) and a tube of 6 feather shuttlecocks. Used casually on weekends. Strings are still tight and responsive.', price: 650, negotiable: true, category_id: 5, condition: 'Good', images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80'] },

  // Miscellaneous (category_id: 6)
  { title: 'Pigeon Electric Kettle 1.5L', description: 'Stainless steel electric kettle, 1500W, auto cutoff. Used daily for 6 months. Works perfectly, no limescale. Selling because going home for semester break.', price: 450, negotiable: false, category_id: 6, condition: 'Good', images: ['https://images.unsplash.com/photo-1544698247-c36e47c7f2af?w=600&q=80'] },
  { title: 'Philips Table Fan (Turbo)', description: '3-speed table fan with tilt adjustment. Works great, a tiny rattle at max speed but nothing affecting airflow. Perfect for summer hostel life.', price: 700, negotiable: true, category_id: 6, condition: 'Used', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'] },
  { title: 'Chess Board + Pieces (Wooden)', description: 'Classic wooden chess set, weighted pieces. All 32 pieces present. Minor scuff on board edge. Great for hostel common room or personal use.', price: 300, negotiable: false, category_id: 6, condition: 'Good', images: ['https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80'] },
];

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // ── 1. Promote akshitkala72@gmail.com to admin ───────────────────────────
  console.log(`\n1. Promoting ${ADMIN_EMAIL} to admin...`);

  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) { console.error('❌ listUsers failed:', listErr.message); process.exit(1); }

  const adminUser = users.find(u => u.email === ADMIN_EMAIL);
  if (!adminUser) {
    console.error(`❌ User ${ADMIN_EMAIL} not found. Make sure they have signed up first.`);
    process.exit(1);
  }

  const { error: promoteErr } = await admin
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', adminUser.id);

  if (promoteErr) { console.error('❌ Promote failed:', promoteErr.message); process.exit(1); }
  console.log(`✅ ${ADMIN_EMAIL} (${adminUser.id}) promoted to admin.`);

  // ── 2. Create a seed seller user for dummy listings ──────────────────────
  console.log('\n2. Creating seed seller user...');

  const seedEmail = `seed_seller_${Date.now()}@campus.edu`;
  const { data: { user: seedUser }, error: createErr } = await admin.auth.admin.createUser({
    email: seedEmail,
    password: 'SeedUser999!',
    email_confirm: true,
    user_metadata: { full_name: 'Priya Mehta' },
  });

  if (createErr || !seedUser) { console.error('❌ Seed user creation failed:', createErr?.message); process.exit(1); }
  console.log(`✅ Seed seller created: ${seedEmail} (${seedUser.id})`);

  // Wait a moment for the trigger to fire
  await new Promise(r => setTimeout(r, 1500));

  // Add WhatsApp number to seed seller's profile
  await admin.from('profiles').update({ whatsapp_number: '+919876543210' }).eq('id', seedUser.id);

  // ── 3. Insert dummy listings ─────────────────────────────────────────────
  console.log('\n3. Inserting 18 dummy listings...');

  const { nanoid } = await import('nanoid');
  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  }

  let inserted = 0;
  for (const listing of DUMMY_LISTINGS) {
    const slug = `${slugify(listing.title)}-${nanoid(5)}`;
    const { error: insertErr } = await admin.from('listings').insert({
      seller_id: seedUser.id,
      slug,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      negotiable: listing.negotiable,
      category_id: listing.category_id,
      condition: listing.condition,
      images: listing.images,
      status: 'approved',
    });

    if (insertErr) {
      console.error(`  ❌ Failed to insert "${listing.title}":`, insertErr.message);
    } else {
      inserted++;
      console.log(`  ✅ [${inserted}] ${listing.title} — ₹${listing.price}`);
    }
  }

  console.log(`\n✅ Inserted ${inserted}/${DUMMY_LISTINGS.length} listings.`);
  console.log('\n🎉 Seed complete!');
  console.log(`   Admin:  ${ADMIN_EMAIL}`);
  console.log(`   Seller: ${seedEmail} (dummy listings owner)`);
  console.log(`   Listings: ${inserted} across 6 categories`);
}

seed().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
