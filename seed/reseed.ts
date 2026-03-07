import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Category } from "../models/Category";
import { User } from "../models/User";
import { Listing } from "../models/Listing";

// ─── STEP 1: Ensure correct category slugs ───────────────────────────────────
const categorySeed = [
    { name: "Electronics",  slug: "electronics",  icon: "💻", order: 1 },
    { name: "Books & Notes",slug: "books-notes",  icon: "📚", order: 2 },
    { name: "Furniture",    slug: "furniture",    icon: "🪑", order: 3 },
    { name: "Clothing",     slug: "clothing",     icon: "👕", order: 4 },
    { name: "Sports & Fitness", slug: "sports-fitness", icon: "⚽", order: 5 },
    { name: "Miscellaneous",slug: "miscellaneous",icon: "📦", order: 6 },
];

// ─── STEP 2: 20 diverse LPU campus listings ───────────────────────────────────
const listingsData = [
    {
        title: "Realme 9 Pro+ - 6 months old",
        description: "Selling my Realme 9 Pro+, 6GB/128GB. Sony IMX766 camera, great for photography. Used with tempered glass and back cover from day 1. No scratches. Comes with original box, charger, and cable. Battery health is excellent.",
        price: 14500,
        negotiable: true,
        condition: "like-new",
        categorySlug: "electronics",
        images: [
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
        ],
    },
    {
        title: "Engineering Mathematics Vol 1 & 2 - RD Sharma",
        description: "Both volumes of RD Sharma Engineering Mathematics. Used for 1st year B.Tech. Some pencil marks on Vol 1 but Vol 2 is clean. Very helpful for university exams. Selling as I've moved to 2nd year.",
        price: 380,
        negotiable: false,
        condition: "good",
        categorySlug: "books-notes",
        images: [
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800",
        ],
    },
    {
        title: "Foldable Study Chair - Comfortable",
        description: "Lightweight foldable study chair with cushioned seat. Used for 9 months in my hostel room. Very comfortable for long study sessions. Easy to carry and store. Can test before buying.",
        price: 800,
        negotiable: true,
        condition: "good",
        categorySlug: "furniture",
        images: [
            "https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=800",
        ],
    },
    {
        title: "Boat Airdopes 141 - Perfect Working",
        description: "Boat Airdopes 141 TWS earbuds. 42 hours total playback, IWP technology. Used occasionally. Both buds and charging case in perfect condition. Selling because I bought Sony WF-1000XM4.",
        price: 700,
        negotiable: true,
        condition: "like-new",
        categorySlug: "electronics",
        images: [
            "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800",
        ],
    },
    {
        title: "Physics Wallah Fast-Track Notes - Complete Set",
        description: "Complete PW Fast-Track handwritten notes for JEE/NEET. Covers Physics, Chemistry, Math. Very neat and well-organized. Ideal if you're preparing alongside your B.Tech. All modules included.",
        price: 600,
        negotiable: false,
        condition: "good",
        categorySlug: "books-notes",
        images: [
            "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800",
        ],
    },
    {
        title: "Cosco Basketball - Size 7",
        description: "Cosco Championship series size 7 basketball. Used about 20 times. Good rubber grip, holds air perfectly. Selling as my badminton team needs funds for shuttle cocks.",
        price: 950,
        negotiable: true,
        condition: "good",
        categorySlug: "sports-fitness",
        images: [
            "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
        ],
    },
    {
        title: "HP 15s Laptop - Core i5 11th Gen",
        description: "HP 15s-eq2143au, AMD Ryzen 5 5500U, 8GB RAM, 512GB SSD. 15.6 inch Full HD display. Used for 1.5 years. Runs very smoothly, no issues. Comes with original charger and HP bag. Selling because I bought a MacBook.",
        price: 42000,
        negotiable: true,
        condition: "good",
        categorySlug: "electronics",
        images: [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
            "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800",
        ],
    },
    {
        title: "Levi's 511 Slim Jeans - Size 32",
        description: "Levi's 511 slim fit jeans in dark indigo, waist 32, length 34. Worn about 10 times, washed properly. No fading or damage. Original MRP ₹3,999. Selling because it doesn't fit anymore after gym.",
        price: 1400,
        negotiable: true,
        condition: "like-new",
        categorySlug: "clothing",
        images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        ],
    },
    {
        title: "Wooden Bookshelf - 3 Tier",
        description: "3-tier wooden bookshelf, brown finish, 2.5ft tall. Holds up to 80 books. Was in my room but shifting to a smaller room. Some minor scratches on edges but solid and sturdy. Contact for pickup from hostel.",
        price: 1100,
        negotiable: true,
        condition: "used",
        categorySlug: "furniture",
        images: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        ],
    },
    {
        title: "JBL Clip 4 Bluetooth Speaker",
        description: "JBL Clip 4 compact portable Bluetooth speaker. IP67 waterproof. 10 hours of playtime. Carabiner clip for easy carry. Selling because I prefer headphones now. All accessories included.",
        price: 2200,
        negotiable: false,
        condition: "like-new",
        categorySlug: "electronics",
        images: [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
        ],
    },
    {
        title: "Data Structures & Algorithms - Narasimha Karumanchi",
        description: "The famous DSA book by Karumanchi. Covers arrays, linked lists, trees, graphs, DP, and much more. Some yellow highlighting on important pages. Perfect for placement prep and interviews at top companies.",
        price: 550,
        negotiable: false,
        condition: "good",
        categorySlug: "books-notes",
        images: [
            "https://images.unsplash.com/photo-1585849834908-3781234b2c37?w=800",
        ],
    },
    {
        title: "Campus Cycling - Hero Sprint Pro 21-speed",
        description: "Hero Sprint Pro 26T, 21-speed mountain bike. Used for 8 months for commuting between blocks. Tyres, brakes, and gears all in great condition. Recently serviced. Perfect for campus commute.",
        price: 5800,
        negotiable: true,
        condition: "good",
        categorySlug: "miscellaneous",
        images: [
            "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
        ],
    },
    {
        title: "Nike Dri-FIT Running T-Shirt (M)",
        description: "Nike Dri-FIT moisture wicking running t-shirt, size M, black. Bought for ₹1,800. Worn only to gym about 6-7 times. Washed properly after every use. No pilling or fade.",
        price: 750,
        negotiable: true,
        condition: "like-new",
        categorySlug: "clothing",
        images: [
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800",
        ],
    },
    {
        title: "Mi 10000mAh Power Bank (2nd Gen)",
        description: "Xiaomi Mi 10000mAh portable power bank. 18W fast charging. Two USB-A outputs + Type-C input. Works perfectly. No scratches. Selling because I got a bigger 20000mAh one for travelling.",
        price: 900,
        negotiable: false,
        condition: "good",
        categorySlug: "electronics",
        images: [
            "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
        ],
    },
    {
        title: "Complete DBMS Handwritten Notes - Anna University Pattern",
        description: "Full semester DBMS notes covering ER diagrams, normalization up to BCNF, SQL, transactions, concurrency control. Very neatly written with examples. Ideal for viva and final exams.",
        price: 180,
        negotiable: false,
        condition: "good",
        categorySlug: "books-notes",
        images: [
            "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800",
        ],
    },
    {
        title: "Resistance Bands Set (5 levels)",
        description: "Set of 5 resistance bands for home/hostel workout. Light to extra heavy. Great for strength training, yoga, and physiotherapy. Used only 3 times, still like new. Comes with carry bag.",
        price: 450,
        negotiable: false,
        condition: "like-new",
        categorySlug: "sports-fitness",
        images: [
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
        ],
    },
    {
        title: "Philips Table Lamp with USB Port",
        description: "Philips 10W LED desk lamp with USB charging port. 5 brightness levels, 3 color temperatures. Eye-care LED. Perfect for late-night studying. Minor scratch on base, works perfectly.",
        price: 1300,
        negotiable: true,
        condition: "good",
        categorySlug: "miscellaneous",
        images: [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
        ],
    },
    {
        title: "Dell Wireless Mouse + Keyboard Combo",
        description: "Dell KM3322W wireless keyboard and mouse combo. 2.4GHz, plug-and-play USB receiver. Quiet keystrokes. AA batteries included. Works with Windows and Mac. Selling because I now use laptop-only.",
        price: 1600,
        negotiable: true,
        condition: "good",
        categorySlug: "electronics",
        images: [
            "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
        ],
    },
    {
        title: "Yoga Mat - 6mm Thick Premium",
        description: "BOLDFIT 6mm anti-slip yoga mat with carry strap. Navy blue. Used for 4 months. Washed and cleaned. Perfect for yoga, stretching, and bodyweight exercises in your room.",
        price: 600,
        negotiable: false,
        condition: "good",
        categorySlug: "sports-fitness",
        images: [
            "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=800",
        ],
    },
    {
        title: "Instant Pot Duo 3L Mini - Electric Cooker",
        description: "Instant Pot Duo Mini 3L 7-in-1 pressure cooker. Perfect for hostel cooking. Can make rice, dal, pasta, soup in minutes. Used 2 months, selling because hostel now provides mess food. All accessories included.",
        price: 3500,
        negotiable: true,
        condition: "like-new",
        categorySlug: "miscellaneous",
        images: [
            "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800",
        ],
    },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function reseed() {
    if (!process.env.MONGODB_URI) {
        console.error("❌  MONGODB_URI not set in .env.local");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅  Connected to MongoDB");

    // 1. Ensure categories with correct slugs exist
    console.log("📂  Upserting categories...");
    for (const cat of categorySeed) {
        await Category.findOneAndUpdate(
            { slug: cat.slug },
            { ...cat, isActive: true },
            { upsert: true, new: true }
        );
    }
    console.log(`   ✓ ${categorySeed.length} categories ready`);

    // 2. Delete OLD dummy users (UIDs starting with 'dummy-' or 'admin-user')
    console.log("🗑   Removing old dummy users...");
    const dummyUids = [
        "dummy-user-1", "dummy-user-2", "dummy-user-3",
        "admin-user",
        /^dummy-/
    ];
    const dummyUserDocs = await User.find({
        $or: [
            { uid: { $regex: /^dummy-/ } },
            { uid: "admin-user" },
            { email: /student[0-9]+@lpu\.in/ },
            { email: "admin@unideal.in" },
        ]
    });
    const dummyUserIds = dummyUserDocs.map(u => u._id);

    // Delete listings from dummy users
    const deletedListings = await Listing.deleteMany({ seller: { $in: dummyUserIds }, isDeleted: { $ne: true } });
    // Hard-delete all (including isDeleted ones) for dummy users
    await mongoose.connection.collection("listings").deleteMany({ seller: { $in: dummyUserIds } });
    console.log(`   ✓ Removed ${dummyUserDocs.length} dummy users' listings`);

    await User.deleteMany({
        $or: [
            { uid: { $regex: /^dummy-/ } },
            { uid: "admin-user" },
            { email: { $regex: /student[0-9]+@lpu\.in/ } },
            { email: "admin@unideal.in" },
        ]
    });
    console.log(`   ✓ Dummy users removed`);

    // 3. Find the real account
    const seller = await User.findOne({ email: "akshitkala72@gmail.com" });
    if (!seller) {
        console.error("❌  User akshitkala72@gmail.com not found in the database.");
        console.error("    Please log in to the app first so the account is created, then run this script again.");
        process.exit(1);
    }
    console.log(`👤  Seller found: ${seller.displayName} (${seller._id})`);

    // 4. Delete ALL existing listings from this seller (clean slate)
    await mongoose.connection.collection("listings").deleteMany({ seller: seller._id });
    console.log(`   ✓ Cleared existing listings from ${seller.email}`);

    // 5. Seed 20 new listings
    console.log("🌱  Seeding 20 new listings...");
    let created = 0;

    for (const data of listingsData) {
        const category = await Category.findOne({ slug: data.categorySlug });
        if (!category) {
            console.warn(`   ⚠  Category not found: ${data.categorySlug} — skipping`);
            continue;
        }

        // Random created date within the last 14 days
        const createdAt = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);
        const expiresAt = new Date(createdAt);
        expiresAt.setDate(expiresAt.getDate() + 60);

        await Listing.create({
            title:       data.title,
            description: data.description,
            price:       data.price,
            negotiable:  data.negotiable,
            condition:   data.condition,
            images:      data.images,
            category:    category._id,
            seller:      seller._id,
            location:    "LPU Campus, Phagwara",
            status:      "approved",
            isDeleted:   false,
            isExpired:   false,
            aiFlagged:   false,
            aiVerification: { checked: true, flagged: false, confidence: 0 },
            expiresAt,
            createdAt,
        });

        created++;
        process.stdout.write(`   ${created}/20 — ${data.title.substring(0, 45)}\n`);
    }

    console.log(`\n🎉  Done! ${created} listings seeded for ${seller.email}`);
    await mongoose.disconnect();
    process.exit(0);
}

reseed().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
