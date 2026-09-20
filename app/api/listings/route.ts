import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createListingSchema } from '@/lib/validation/listing';
import { generateSlug } from '@/lib/slug';
import type { Database } from '@/types/database';
import type { ListingCondition, ListingStatus } from '@/types/domain';

/**
 * GET /api/listings — Browse listings with filtering, sorting, and pagination.
 * Spec: TRD §5.3, architecture §4
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const condition = searchParams.get('condition') as ListingCondition | null;
    const search = searchParams.get('search')?.trim();
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createServerClient();

    // Query listings joining category and public_profiles
    let query = supabase
      .from('listings')
      .select(
        `
        id,
        slug,
        seller_id,
        title,
        description,
        price,
        negotiable,
        condition,
        images,
        status,
        views,
        created_at,
        categories!inner(id, name, slug),
        public_profiles!inner(id, full_name, is_banned)
      `,
        { count: 'exact' }
      )
      .eq('status', 'approved')
      .eq('public_profiles.is_banned', false);

    if (categorySlug) {
      query = query.eq('categories.slug', categorySlug);
    }

    if (condition) {
      query = query.eq('condition', condition);
    }

    if (search) {
      // ilike search across title and description
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data: listings, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: `Failed to fetch listings: ${error.message}`, code: 'FETCH_ERROR' } },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: {
        listings: listings || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'An unexpected error occurred while fetching listings.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings — Create a new listing.
 * Spec: TRD §5.2, architecture §4
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // 1. Verify authenticated session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'You must be signed in to post a listing.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // 2. Validate request body with Zod
    const body = await request.json();
    const parseResult = createListingSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid listing data';
      return NextResponse.json(
        { error: { message: firstError, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { title, description, price, negotiable, category_id, condition, images } =
      parseResult.data;

    // 3. Check approval mode server-side via service-role client (TRD §3.6, §5.2)
    const adminClient = createAdminClient();
    const { data: settings } = await adminClient
      .from('admin_settings')
      .select('approval_mode')
      .eq('id', 1)
      .single();

    const approvalMode = settings?.approval_mode ?? 'auto';
    const status: ListingStatus = approvalMode === 'manual' ? 'pending' : 'approved';

    // 4. Generate slug
    const slug = generateSlug(title);

    // 5. Insert listing row as authenticated user (RLS listings_insert_own enforces verified + not banned)
    const listing: Database['public']['Tables']['listings']['Insert'] = {
        slug,
        seller_id: user.id,
        title,
        description,
        price,
        negotiable,
        category_id,
        condition,
        images,
        status,
      };

    const { data: newListing, error: insertError } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single();

    if (insertError) {
      if (insertError.message.includes('row-level security') || insertError.code === '42501') {
        return NextResponse.json(
          {
            error: {
              message: 'Verify your email to post listings, or contact support if your account is restricted.',
              code: 'FORBIDDEN',
            },
          },
          { status: 403 }
        );
      }

      console.error('Listing insertion failed', insertError);
      return NextResponse.json(
        { error: { message: 'Could not post your listing. Please try again.', code: 'INSERT_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newListing }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { message: 'Could not post your listing. Please try again.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
