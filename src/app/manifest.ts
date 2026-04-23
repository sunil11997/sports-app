
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'शासकीय माध्यमिक आश्रम शाळा वाघंबा - Sports Hub',
    short_name: 'WGB Sports',
    description: 'Sports & Health Management System for Waghamba School',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F5F1',
    theme_color: '#235C36',
    orientation: 'portrait',
    icons: [
      {
        src: 'https://placehold.co/192x192/235C36/white/png?text=WGB',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://placehold.co/512x512/235C36/white/png?text=Waghamba',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  }
}
