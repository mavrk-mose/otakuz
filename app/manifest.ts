import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Otakuz - Your Anime Community',
    short_name: 'Otakuz',
    description: 'Discover, track, and watch your favorite anime series',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#17181f',
    theme_color: '#17181f',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
