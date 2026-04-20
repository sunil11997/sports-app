
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'शासकीय माध्यमिक आश्रम शाळा वाघंबा - Sports Hub',
    short_name: 'Waghamba Sports',
    description: 'Sports & Health Management System for Waghamba School',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F5F1',
    theme_color: '#235C36',
    icons: [
      {
        src: 'https://picsum.photos/seed/school/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/school/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
