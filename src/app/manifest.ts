import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'शासकीय माध्यमिक आश्रम शाळा वाघंबा - Sports Hub',
    short_name: 'WGB Sports',
    description: 'Professional Sports & Health Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#235C36',
    icons: [
      {
        src: '/icon-41.png',
        sizes: '41x41',
        type: 'image/png',
      },
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
    ],
  }
}
