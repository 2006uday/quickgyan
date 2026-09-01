import React from "react"
import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from "@/lib/auth-context"
import { me } from "@/lib/me"


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  metadataBase: new URL('https://quick-gyan.vercel.app'),
  title: {
    default: 'quickGyan - Your One-Stop Platform for IGNOU BCA Students',
    template: '%s | quickGyan',
  },
  description: 'The centralized academic platform for IGNOU BCA students. Access semester-wise books, sample papers, solved assignments, notes, and AI-powered learning assistance.',
  keywords: [
    'quickGyan',
    'quickgyan',
    'quick gyan',
    'quickgyan.com',
    'IGNOU BCA',
    'IGNOU BCA study material',
    'IGNOU BCA books',
    'IGNOU BCA solved assignments',
    'IGNOU BCA sample papers',
    'IGNOU BCA question papers',
    'IGNOU BCA notes',
    'IGNOU BCA study helper',
    'IGNOU BCA academic platform',
    'IGNOU BCA learning assistant',
    'ignou bca book',
    'ignou bca books',
    'ignu bca book',
    'ignu bca books',
    'ignou bca study material',
    'ignu bca study material',
    'ignou bca notes',
    'ignu bca notes',
    'ignou bca solved assignments',
    'ignu bca solved assignments',
    'ignou bca question papers',
    'ignu bca question papers'
  ],
  generator: 'quickGyan',
  applicationName: 'quickGyan',
  authors: [{ name: 'quickGyan Team' }],
  creator: 'quickGyan Team',
  publisher: 'quickGyan',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quick-gyan.vercel.app',
    title: 'quickGyan - Your One-Stop Platform for IGNOU BCA Students',
    description: 'The centralized academic platform for IGNOU BCA students. Access semester-wise books, sample papers, solved assignments, notes, and AI-powered learning assistance.',
    siteName: 'quickGyan',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'quickGyan Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'quickGyan - Your One-Stop Platform for IGNOU BCA Students',
    description: 'The centralized academic platform for IGNOU BCA students. Access semester-wise books, sample papers, solved assignments, notes, and AI-powered learning assistance.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const user = await me();
  console.log("Server Component User Data:", user);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://quick-gyan.vercel.app/#website',
        'url': 'https://quick-gyan.vercel.app',
        'name': 'quickGyan',
        'description': 'The centralized academic platform for IGNOU BCA students. Access semester-wise books, sample papers, solved assignments, notes, and AI-powered learning assistance.',
        'publisher': {
          '@id': 'https://quick-gyan.vercel.app/#organization'
        },
        'inLanguage': 'en-US'
      },
      {
        '@type': 'Organization',
        '@id': 'https://quick-gyan.vercel.app/#organization',
        'name': 'quickGyan',
        'url': 'https://quick-gyan.vercel.app',
        'logo': {
          '@type': 'ImageObject',
          '@id': 'https://quick-gyan.vercel.app/#logo',
          'url': 'https://quick-gyan.vercel.app/icon.svg',
          'contentUrl': 'https://quick-gyan.vercel.app/icon.svg',
          'caption': 'quickGyan'
        },
        'image': {
          '@id': 'https://quick-gyan.vercel.app/#logo'
        },
        'sameAs': [
          'https://github.com/2006uday/quickgyan'
        ]
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://quick-gyan.vercel.app/#webapplication',
        'name': 'quickGyan',
        'url': 'https://quick-gyan.vercel.app',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'author': {
          '@id': 'https://quick-gyan.vercel.app/#organization'
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-Q4RF49QS34"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Q4RF49QS34');
          `}
        </Script>
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
