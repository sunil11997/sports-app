
import { MetadataRoute } from 'next'

/**
 * Waghamba Sports Hub - PWA Manifest
 * v5.2.0: Added Shot Put Throw Girls cohort and updated Auto Planner.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Waghamba Institutional Sports & Health Hub',
    short_name: 'WGB Hub v5.2',
    description: 'Professional Physical Education & Sports Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e3a8a', 
    theme_color: '#1e3a8a',
    orientation: 'any',
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
