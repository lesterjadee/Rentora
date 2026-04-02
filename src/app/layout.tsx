import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rentora — Student Item Rental Hub',
  description: 'Rent, lend, and manage academic items with your fellow students at Gordon College',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="animate-fade-in">
          {children}
        </div>
      </body>
    </html>
  )
}