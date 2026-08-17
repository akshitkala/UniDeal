import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateListingSlug } from "@/lib/slug";
import { listingSchema } from "@/lib/validation/listing";

// POST /api/listings - Create a new listing
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "You must be signed in to post a listing." } },
        { status: 401 }
      );
    }

    // 2. Validate email verification
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: { message: "Verify your email to continue." } },
        { status: 403 }
      );
    }

    // 3. Parse and validate payload
    const body = await request.json();
    const result = listingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { message: result.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { title, description, price, negotiable, category_id, condition, images } = result.data;

    // 4. Retrieve approval mode from admin settings (server-side service role client query)
    const adminSupabase = createSupabaseAdminClient();
    const { data: settings, error: settingsError } = await adminSupabase
      .from("admin_settings")
      .select("approval_mode")
      .eq("id", 1)
      .single();

    if (settingsError) {
      console.error("Error reading admin settings:", settingsError);
    }

    const approvalMode = settings?.approval_mode ?? "auto";
    const status = approvalMode === "auto" ? "approved" : "pending";

    // 5. Generate slug
    const slug = generateListingSlug(title);

    // 6. Insert listing
    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        title,
        description,
        price,
        negotiable,
        category_id,
        condition,
        images,
        slug,
        status,
      })
      .select()
      .single();

    if (insertError) {
      // Check if slug conflict happened, though highly unlikely due to random suffix
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: { message: "A listing with this title already exists. Try changing the title slightly." } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: { message: insertError.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: listing }, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings unexpected error:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }
}

// GET /api/listings - Retrieve listings list
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    const supabase = await createSupabaseServerClient();

    // Build the query against the public_listings view.
    // This view pre-joins with public_profiles (never the base profiles table),
    // keeping anon's direct access on profiles at genuinely zero.
    // The view already enforces status='approved' AND seller is not banned.
    let query = supabase
      .from("public_listings")
      .select(`
        id, slug, seller_id, title, description, price, negotiable,
        category_id, condition, images, status, views, created_at, updated_at,
        seller_full_name, seller_branch, seller_year
      `);

    // Apply category filter by slug
    if (category) {
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .single();
      
      if (catData) {
        query = query.eq("category_id", catData.id);
      } else {
        query = query.eq("category_id", -1);
      }
    }

    // Apply condition filter
    if (condition) {
      query = query.eq("condition", condition);
    }

    // Apply search filter (ilike title and description)
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    if (sort === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: rawListings, error } = await query;

    if (error) {
      console.error("GET /api/listings query error:", error);
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 500 }
      );
    }

    // Reshape flat view columns into the seller object consumers expect
    const listings = rawListings?.map((l) => ({
      ...l,
      seller: {
        id: l.seller_id,
        full_name: l.seller_full_name,
        branch: l.seller_branch,
        year: l.seller_year,
      },
    })) ?? [];

    return NextResponse.json({ data: listings }, { status: 200 });
  } catch (error) {
    console.error("GET /api/listings unexpected error:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }
}
