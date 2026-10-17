import { createClient as createServerClient } from '@/lib/supabase/server';
import type { ListingCardData } from '@/components/listing/ListingCard';
import type { ListingCondition } from '@/types/domain';

export interface FetchListingsParams {
  categorySlug?: string | null;
  condition?: ListingCondition | null;
  search?: string | null;
  sort?: string | null;
  page?: number;
  limit?: number;
}

export interface FetchListingsResult {
  listings: ListingCardData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchServerListings(params: FetchListingsParams): Promise<FetchListingsResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 20);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createServerClient();

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

  if (params.categorySlug) {
    query = query.eq('categories.slug', params.categorySlug);
  }

  if (params.condition) {
    query = query.eq('condition', params.condition);
  }

  const cleanSearch = params.search?.trim();
  if (cleanSearch) {
    query = query.or(`title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
  }

  if (params.sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (params.sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data: rawListings, error, count } = await query;

  if (error) {
    console.error('fetchServerListings error:', error);
    return {
      listings: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Map to ListingCardData shape
  const listings: ListingCardData[] = (rawListings || []).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    price: item.price,
    negotiable: item.negotiable,
    condition: item.condition as ListingCondition,
    images: Array.isArray(item.images) ? item.images : [],
    created_at: item.created_at,
    categories: item.categories,
    public_profiles: item.public_profiles,
  }));

  return {
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function fetchServerCategories() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('id');

  if (error || !data) {
    return [];
  }
  return data;
}
