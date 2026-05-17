
import { MetadataRoute } from 'next'

/**
 * Waghamba Sports Hub - PWA Manifest
 * Updated to use -icon41.png as the primary identity for high-visibility Android installation.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Waghamba Institutional Sports & Health Hub',
    short_name: 'WGB Sports',
    description: 'Professional Physical Education & Sports Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e3a8a', // Institutional Dark Blue
    theme_color: '#1e3a8a',
    orientation: 'portrait',
    icons: [
      {
        src: '/-icon41.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/-icon41.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/-icon41.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/-icon41.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/-icon41.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  }
}
