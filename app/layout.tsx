import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kholikov Meronshokh - Portfolio',
  description: 'Developer / Creator / Builder',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#8B5CF6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>{children}</body>
    </html>
  )
}
