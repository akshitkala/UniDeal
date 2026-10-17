/**
 * seed_1000_listings.js
 *
 * 1. Clears existing listings from Supabase
 * 2. Updates profiles for both user accounts:
 *    - akshitkala72@gmail.com -> +918826164117, is_admin: true
 *    - akshitkala4@gmail.com  -> +918532999600
 * 3. Seeds 1,000 realistic campus listings:
 *    - 500 under akshitkala72@gmail.com
 *    - 500 under akshitkala4@gmail.com
 *    - Distributed across all 6 categories (~167 each)
 *    - 3 verified, high-quality images per listing from a curated 72-image pool
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env.local
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey);

const USER_1_EMAIL = 'akshitkala72@gmail.com';
const USER_1_PHONE = '+918826164117';

const USER_2_EMAIL = 'akshitkala4@gmail.com';
const USER_2_PHONE = '+918532999600';

// Verified, high-quality Unsplash image pools (12 images per category = 72 distinct variations)
const CATEGORY_IMAGES = {
  // Books & Notes (category_id: 1)
  1: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  ],
  // Electronics (category_id: 2)
  2: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
  ],
  // Furniture (category_id: 3)
  3: [
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
  ],
  // Clothing (category_id: 4)
  4: [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1603251578711-3290ca1a0187?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  ],
  // Sports & Fitness (category_id: 5)
  5: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  ],
  // Miscellaneous (category_id: 6)
  6: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80',
  ]
};

// Realistic seed catalogs per category
const CATALOGS = {
  1: { // Books & Notes
    titles: [
      'Engineering Mathematics Vol 1 & 2 (BS Grewal)',
      'Introduction to Algorithms — Cormen (CLRS 3rd Ed)',
      'Data Structures and Algorithms in C++ (Mark Weiss)',
      'Operating System Concepts (Silberschatz Galvin)',
      'Database System Concepts (Korth, Sudarshan)',
      'Computer Networks (Tanenbaum 5th Edition)',
      'Signals and Systems (Oppenheim & Willsky)',
      'Digital Logic and Computer Design (M. Morris Mano)',
      'Microelectronic Circuits (Sedra & Smith)',
      'Principles of Compiler Design (Aho Ullman Sethi)',
      'Machine Learning with Python Course Textbook',
      'Artificial Intelligence: Modern Approach (Russell Norvig)',
      'Handwritten Notes — Complete DSA & LeetCode Prep',
      'GATE CS & IT Previous 20 Years Solved Papers',
      'Linear Algebra Done Right (Sheldon Axler)',
      'Engineering Mechanics (Beer & Johnston)',
      'Thermodynamics: An Engineering Approach (Cengel)',
      'Organic Chemistry (Clayden, Greeves & Warren)',
      'Modern Physics for Scientists and Engineers',
      'Theory of Computation (Michael Sipser)',
      'Discrete Mathematics and Its Applications (Rosen)',
      'Electric Circuits 10th Edition (Nilsson Riedel)',
      'Microeconomics for Engineers (Mankiw)',
      'Object-Oriented Programming with Java (E. Balagurusamy)',
      'Web Development Bootcamp Comprehensive Workbook'
    ],
    minPrice: 150,
    maxPrice: 850
  },
  2: { // Electronics
    titles: [
      'boAt Rockerz 450 Bluetooth On-Ear Headphones',
      'Sony WH-CH520 Wireless Bluetooth Headphones',
      'Apple AirPods 2nd Gen with Charging Case',
      'Logitech K380 Multi-Device Wireless Keyboard',
      'Logitech MX Master 2S Ergonomic Mouse',
      'Redragon Kumara K552 Mechanical Keyboard RGB',
      'Mi 20000mAh Power Bank 3i (18W Fast Charging)',
      'Anker 65W GaN Fast Charger with Type-C Cable',
      'USB-C Hub 7-in-1 Adapter for MacBook & Laptop',
      'Havit Laptop Cooling Pad with 3 Quiet Fans',
      'Casio FX-991EX Classwiz Scientific Calculator',
      'SanDisk 128GB Ultra Dual Drive Luxe USB Type-C',
      'Dell 24-inch Full HD IPS Borderless Monitor',
      'Zebronics Zeb-Warrior 2.0 USB Gaming Speakers',
      'JBL Go 3 Ultra-Portable Waterproof Speaker',
      'TP-Link Archer C6 Dual-Band AC1200 WiFi Router',
      'Wacom One By CTL-472 Graphic Drawing Tablet',
      'boAt Wave Lite Smartwatch 1.69 HD Display',
      'Portronics Portable Laptop Table with Fan & Mouse Pad',
      'HP Wireless Optical Mouse 250 with USB Dongle',
      'OnePlus Bullets Wireless Z2 Neckband Earphones',
      'Seagate 1TB One Touch External Hard Drive',
      'Realme Pad Mini 8.7-inch Tablet (WiFi 32GB)',
      'Baseus ScreenBar Monitor Light Bar for Studying',
      'Ring Light 10-inch with Tripod Stand for Video Calls'
    ],
    minPrice: 350,
    maxPrice: 6500
  },
  3: { // Furniture
    titles: [
      'Wooden Study Desk with 2 Storage Drawers',
      'Ergonomic Mid-Back Mesh Office Chair with Arms',
      'Nilkamal Heavy Duty Plastic Chair (Pack of 2)',
      'Foldable Bed Table for Laptop with Cup Holder',
      '3-Tier Multipurpose Corner Storage Rack',
      'Compact Wooden Bookshelf (Holds 50+ Books)',
      'Hostel Bedside Table with Pull-out Drawer',
      'Adjustable Height Study Stool with Cushion',
      'Foldable Clothes Drying Stand — Rust Proof Steel',
      'Over-the-Door 6-Hook Coat & Bag Organizer',
      'Single Bed Mattress (Coir + Foam 4-inch)',
      'Floor Standing Full Length Dressing Mirror',
      'Foldable Camping & Balcony Recliner Chair',
      'Collapsible Fabric Wardrobe / Storage Organizer',
      'Wooden Laptop Stand for Desk with Heat Dissipation',
      'Under-Bed Rolling Storage Container with Wheels',
      'Shoe Rack 4-Tier Metal Organizer (Holds 12 Pairs)',
      'Wall Mount Floating Bookshelf (Set of 3)',
      'Bean Bag XXL (Black Faux Leather with Beans)',
      'Cushioned Floor Seating / Meditation Pouf'
    ],
    minPrice: 200,
    maxPrice: 3200
  },
  4: { // Clothing
    titles: [
      'Campus Fleece Pullover Hoodie — Charcoal Grey (L)',
      'Official College Fest Varsity Jacket — Navy (M)',
      'Nike Revolution 6 Running Shoes — Men UK 9',
      'Adidas Essentials 3-Stripes Trackpants (L)',
      'Levi\'s 511 Slim Fit Denim Jeans — 32W 32L',
      'Peter England Formal Slim-Fit White Shirt (40)',
      'Allen Solly Casual Cotton Chinos — Olive Green (32)',
      'Puma Men\'s Crew Neck Sweatshirt — Black (M)',
      'Wildcraft 35L Water Resistant College Backpack',
      'The North Face Lightweight Windbreaker Jacket',
      'American Tourister Laptop Backpack 30L',
      'Raymond 2-Piece Formal Suit Blazer (Size 38)',
      'Van Heusen Formal Blue Stripes Shirt (Size 39)',
      'Decathlon Quechua Hiking Fleece Warm Jacket',
      'Converse Chuck Taylor All Star Low Tops — UK 8',
      'Woodland Genuine Leather Casual Boots — UK 8',
      'Fastrack Denim Strap Casual Analog Watch',
      'Ray-Ban Wayfarer Classic Sunglasses with Case',
      'Oversized Anime Graphic Hoodie — Sage Green (XL)',
      'Under Armour Tech 2.0 Short Sleeve Gym Tee (M)'
    ],
    minPrice: 250,
    maxPrice: 2200
  },
  5: { // Sports & Fitness
    titles: [
      'Yonex Nanoray 7000I Badminton Racket + Full Cover',
      'Yonex Mavis 350 Nylon Shuttles (Tube of 6)',
      'Cosco English Willow Cricket Bat (Full Size 6)',
      'Nivia Storm Football Size 5 (FIFA Approved Size)',
      'Spalding NBA Official Composite Leather Basketball',
      'Decathlon Domyos Hexagonal Dumbbell Set 5kg Pair',
      'Kobo Rubber Hex Dumbbells 10kg (Pair)',
      'Boldfit 5-Level Resistance Tubes Workout Kit',
      'Strauss High Density 6mm TPE Yoga Mat with Strap',
      'Nivia Pro Carbon Table Tennis Bat Pair + 3 Balls',
      'Hero Sprint 26T Mountain Bicycle with 21 Gears',
      'Decathlon Cycling Helmet with Rear Safety Light',
      'Speedo Ergonomic Swimming Goggles Anti-Fog',
      'Gym Duffle Bag with Shoe Compartment — Waterproof',
      'Grip Strength Trainer Kit (Adjustable 10-60kg)',
      'Kore 20kg PVC Weight Plates + 3ft Curl Rod Set',
      'Nivia Classic Wrist Support Gym Gloves (Large)',
      'Skipping Rope with High Speed Ball Bearings',
      'Stainless Steel Gym Shaker Bottle with Wire Whisk',
      'Kipsta Sports Shin Guards with Ankle Protection'
    ],
    minPrice: 150,
    maxPrice: 4800
  },
  6: { // Miscellaneous
    titles: [
      'Prestige 1.5L Stainless Steel Electric Kettle',
      'Pigeon by Stovekraft 1.8L Multi-Cook Electric Kettle',
      'Bajaj Ultima 200mm Table Fan with High Airflow',
      'Philips 9W EyeCare Rechargeable LED Desk Lamp',
      'Classic Handcrafted Wooden Magnetic Chess Set (12x12)',
      'Milton Thermosteel 1000ml Hot & Cold Flask',
      'Anchor 4-Socket Extension Cord Spike Guard with Switch',
      'Havells 1200W Foldable Travel Hair Dryer',
      'Wipro 16A Smart Plug with Energy Monitoring',
      'Cello Tri-Ply Stainless Steel Casserole Hot Pot',
      'Hostel Laundry Mesh Bag with Drawstring Handles',
      'Waterproof Double-Sided Desk Mat / Mousepad (90x40cm)',
      'Mini Ceramic Coffee Mug Set of 2 (Microwave Safe)',
      'Scotch Thermal Laminator Machine for A4 Documents',
      'Heavy Duty Brass Padlock with 3 Keys for Hostel Locker',
      'Mosquito Net for Single Bed (Pop-up Foldable)',
      'Godrej aer Pocket Bathroom & Wardrobe Fragrance (Pack of 3)',
      'Digital Weighing Scale for Body Weight (Tempered Glass)',
      'Compact First Aid Medical Kit with Essential Supplies',
      'Rechargeable Mosquito Swatter Bat with LED Light'
    ],
    minPrice: 120,
    maxPrice: 1600
  }
};

const CONDITIONS = ['Like New', 'Good', 'Used', 'New'];
const REASONS = [
  'Used for one semester only, completely intact.',
  'Graduating this semester, selling extra hostel items.',
  'Upgrading to a newer model, works 100% fine.',
  'Well maintained, no issues whatsoever.',
  'Purchased recently, barely used.',
  'Moving out of campus hostel, urgent sale.',
  'Clean and ready for immediate pick up.',
  'Original bills and accessories included if applicable.'
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 45);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Pick 3 distinct images from the category pool
function pickThreeImages(pool) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

async function runSeed() {
  console.log('🚀 Starting UniDeal 1,000 Listing Seeding Script...\n');

  // ── Step 1: Verify users ──────────────────────────────────────────────
  console.log('1. Checking user accounts in Supabase...');
  const { data: { users }, error: listUsersErr } = await admin.auth.admin.listUsers();
  if (listUsersErr) {
    throw new Error('Failed to list users: ' + listUsersErr.message);
  }

  const user1 = users.find(u => u.email === USER_1_EMAIL);
  const user2 = users.find(u => u.email === USER_2_EMAIL);

  if (!user1) throw new Error(`User ${USER_1_EMAIL} not found in Supabase Auth.`);
  if (!user2) throw new Error(`User ${USER_2_EMAIL} not found in Supabase Auth.`);

  console.log(`  Found User 1: ${USER_1_EMAIL} (${user1.id})`);
  console.log(`  Found User 2: ${USER_2_EMAIL} (${user2.id})`);

  // Ensure both users are confirmed
  if (!user1.email_confirmed_at) {
    await admin.auth.admin.updateUserById(user1.id, { email_confirm: true });
  }
  if (!user2.email_confirmed_at) {
    await admin.auth.admin.updateUserById(user2.id, { email_confirm: true });
  }

  // ── Step 2: Update Profiles with Phone Numbers ─────────────────────────
  console.log('\n2. Updating profiles with phone numbers and admin permissions...');

  const { error: p1Err } = await admin
    .from('profiles')
    .update({
      whatsapp_number: USER_1_PHONE,
      is_admin: true,
      full_name: 'Akshit Kala'
    })
    .eq('id', user1.id);
  if (p1Err) console.warn('  Warning updating User 1 profile:', p1Err.message);
  else console.log(`  ✅ User 1 (${USER_1_EMAIL}) updated: WhatsApp=${USER_1_PHONE}, is_admin=true`);

  const { error: p2Err } = await admin
    .from('profiles')
    .update({
      whatsapp_number: USER_2_PHONE,
      full_name: 'Akshit'
    })
    .eq('id', user2.id);
  if (p2Err) console.warn('  Warning updating User 2 profile:', p2Err.message);
  else console.log(`  ✅ User 2 (${USER_2_EMAIL}) updated: WhatsApp=${USER_2_PHONE}`);

  // ── Step 3: Delete Existing Dummy Listings ─────────────────────────────
  console.log('\n3. Removing all existing dummy listings...');

  // Delete reports & contact reveals first if needed, or cascade
  const { error: delReportsErr } = await admin
    .from('reports')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (delReportsErr) console.warn('  Note on reports cleanup:', delReportsErr.message);

  const { error: delRevealsErr } = await admin
    .from('contact_reveals')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (delRevealsErr) console.warn('  Note on reveals cleanup:', delRevealsErr.message);

  const { error: delListingsErr } = await admin
    .from('listings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (delListingsErr) {
    throw new Error('Failed to delete existing listings: ' + delListingsErr.message);
  }
  console.log('  ✅ Existing listings cleared.');

  // ── Step 4: Generate 1,000 Listings ────────────────────────────────────
  console.log('\n4. Generating 1,000 listings across 6 categories...');

  const listingsToInsert = [];
  const sellers = [user1.id, user2.id];
  const TOTAL_LISTINGS = 1000;
  const categories = [1, 2, 3, 4, 5, 6];

  for (let i = 0; i < TOTAL_LISTINGS; i++) {
    // 500 under user1, 500 under user2 (alternating)
    const sellerId = sellers[i % 2];
    const categoryId = categories[i % categories.length];
    const catalog = CATALOGS[categoryId];

    const baseTitle = getRandomElement(catalog.titles);
    // Add realistic variation suffixes if needed for unique title flavor
    const title = i >= catalog.titles.length
      ? `${baseTitle} — Series ${Math.floor(i / catalog.titles.length) + 1}`
      : baseTitle;

    const baseSlug = slugify(title);
    const uniqueSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const price = Math.round(getRandomInt(catalog.minPrice, catalog.maxPrice) / 10) * 10;
    const condition = getRandomElement(CONDITIONS);
    const reason = getRandomElement(REASONS);
    const description = `${title}. Condition: ${condition}. ${reason} Available for campus pickup. DM on WhatsApp to close deal.`;
    const negotiable = Math.random() < 0.45;
    const views = getRandomInt(5, 160);

    // Pick 3 distinct images for this category
    const images = pickThreeImages(CATEGORY_IMAGES[categoryId]);

    // Distribute creation date across the last 30 days
    const daysAgo = (TOTAL_LISTINGS - i) / TOTAL_LISTINGS * 28;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - getRandomInt(100, 3600000)).toISOString();

    listingsToInsert.push({
      slug,
      seller_id: sellerId,
      title,
      description,
      price,
      negotiable,
      category_id: categoryId,
      condition,
      images,
      status: 'approved',
      views,
      created_at: createdAt,
      updated_at: createdAt
    });
  }

  console.log(`  Generated ${listingsToInsert.length} listing objects.`);
  console.log(`  User 1 (${USER_1_EMAIL}): ${listingsToInsert.filter(l => l.seller_id === user1.id).length} listings`);
  console.log(`  User 2 (${USER_2_EMAIL}): ${listingsToInsert.filter(l => l.seller_id === user2.id).length} listings`);

  // ── Step 5: Batch Insert into Supabase ──────────────────────────────────
  console.log('\n5. Inserting listings in batches of 50...');

  const BATCH_SIZE = 50;
  let insertedCount = 0;

  for (let b = 0; b < listingsToInsert.length; b += BATCH_SIZE) {
    const batch = listingsToInsert.slice(b, b + BATCH_SIZE);
    const { error: insertErr } = await admin.from('listings').insert(batch);

    if (insertErr) {
      console.error(`  ❌ Batch ${b / BATCH_SIZE + 1} failed:`, insertErr.message);
      throw insertErr;
    }

    insertedCount += batch.length;
    process.stdout.write(`  ⏳ Inserted ${insertedCount}/${listingsToInsert.length} listings...\r`);
  }

  console.log(`\n\n🎉 Successfully inserted ${insertedCount} listings!`);

  // ── Step 6: Verify Database Totals ─────────────────────────────────────
  console.log('\n6. Verifying database totals...');
  const { count: finalCount, error: countErr } = await admin
    .from('listings')
    .select('*', { count: 'exact', head: true });

  if (countErr) console.warn('  Count query warning:', countErr.message);
  else console.log(`  Total listings in DB: ${finalCount}`);

  // Count by category
  for (const catId of categories) {
    const { count: catCount } = await admin
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', catId);
    console.log(`  Category ${catId}: ${catCount} listings`);
  }

  console.log('\n✨ Seeding completed successfully!');
}

runSeed().catch(err => {
  console.error('\n❌ Fatal error running seed script:', err);
  process.exit(1);
});
