import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/help-support',
        '/privacy-policy',
        '/contact-us',
      ],
      disallow: [
        '/admin/',
        '/dashboard/',
        '/login',
        '/signup',
        '/api/',
      ],
    },
    sitemap: 'https://quickgyan.vercel.app/sitemap.xml',
  }
}
