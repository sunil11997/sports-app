
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sports App',
    short_name: 'Sports',
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
      }
    ],
  }
}
