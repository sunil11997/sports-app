import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Waghamba Sports Health Hub',
    short_name: 'Waghamba Sports',
    description: 'Institutional Sports & Health Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F5F1',
    theme_color: '#235C36',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  }
}
