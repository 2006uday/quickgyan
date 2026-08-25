import React from "react"
import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from "@/lib/auth-context"
import { me } from "@/lib/me"


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  metadataBase: new URL('https://quickgyan.vercel.app'),
  title: {
    default: 'quickGyan - Your One-Stop Platform for Academic Learning',
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
    'IGNOU study helper',
    'IGNOU academic platform',
    'IGNOU learning assistant',
    'IGNOU online support'
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
    url: 'https://quickgyan.vercel.app',
    title: 'quickGyan - Your One-Stop Platform for Academic Learning',
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
    title: 'quickGyan - Your One-Stop Platform for Academic Learning',
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

  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
