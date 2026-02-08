import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import ReduxProvider from '+/redux/Provider'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Properties manager.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Properties',
    description: 'Properties manager.',
    images: [
      {
        url: `${baseUrl}/home.png`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Properties',
    description: 'Properties manager.',
    images: [`${baseUrl}/home.png`],
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
