import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UniDeal — Campus Marketplace',
    short_name: 'UniDeal',
    description: 'Buy and sell physical items with verified students on your university campus.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#166534',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
