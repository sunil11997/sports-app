
import { MetadataRoute } from 'next'

/**
 * Waghamba Sports Hub - PWA Manifest
 * Configured for Institutional Branding and Native Android Splash Screens.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Waghamba Institutional Sports & Health Hub',
    short_name: 'WGB Sports',
    description: 'Professional Physical Education & Sports Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e3a8a', // Matching primary blue for native splash screen
    theme_color: '#1e3a8a',
    orientation: 'portrait',
    icons: [
      {
        src: '/-icon41.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/-icon41.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  }
}
