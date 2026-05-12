import { MetadataRoute } from 'next'

/**
 * Waghamba Sports Hub - PWA Manifest
 * Configures how the app appears when installed on a device.
 * Meets all criteria for modern browser "Add to Home Screen" eligibility.
 * PURPOSES: 'maskable' ensures the icon covers the full area on Android.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Waghamba Institutional Sports & Health Hub',
    short_name: 'WGB Sports',
    description: 'Professional Physical Education & Sports Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
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
      }
    ],
  }
}
