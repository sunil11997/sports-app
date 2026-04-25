import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'शासकीय माध्यमिक आश्रम शाळा वाघंबा - Sports Hub',
    short_name: 'Waghamba Sports',
    description: 'Institutional Sports & Health Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#235C36',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  }
}
