
import { MetadataRoute } from 'next'

/**
 * Waghamba Sports Hub - PWA Manifest
 * Updated to use icon-512.png as the primary high-resolution identity for installation.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Waghamba Institutional Sports & Health Hub',
    short_name: 'WGB Sports',
    description: 'Professional Physical Education & Sports Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e3a8a', 
    theme_color: '#1e3a8a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
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
