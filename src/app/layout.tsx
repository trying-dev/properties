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
const marketingTitle = 'Properties | Arrienda con un proceso que te acompaña'
const marketingDescription = 'Encuentra hogar o publica tu propiedad con un proceso guiado, pagos claros y acompañamiento en cada paso.'

export const metadata: Metadata = {
  title: marketingTitle,
  description: marketingDescription,
  metadataBase: new URL(baseUrl),
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: marketingTitle,
    description: marketingDescription,
    type: 'website',
    url: '/',
    siteName: 'Properties',
    images: [
      {
        url: `${baseUrl}/home.png`,
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: marketingTitle,
    description: marketingDescription,
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
