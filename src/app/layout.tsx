import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rentora — Student Item Rental Hub',
  description: 'Rent and lend academic items within your college campus network.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  themeColor: '#0F3D2A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Rentora',
  },
  openGraph: {
    title: 'Rentora — Student Item Rental Hub',
    description: 'Rent and lend academic items within your college campus network.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F3D2A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rentora" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}