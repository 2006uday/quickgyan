import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/login',
          '/signup',
          '/api',
        ],
      },
    ],
    sitemap: 'https://quick-gyan.vercel.app/sitemap.xml',
  }
}
