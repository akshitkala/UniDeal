import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/our-story`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return staticRoutes;
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    const { data: listings } = await supabase
      .from('listings')
      .select('slug, updated_at')
      .eq('status', 'approved')
      .limit(500);

    const listingRoutes: MetadataRoute.Sitemap = (listings || []).map((l) => ({
      url: `${baseUrl}/listing/${l.slug}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}
