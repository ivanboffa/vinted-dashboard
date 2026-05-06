import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vinted Analytics',
  description: 'Dashboard analytics per il mercato Vinted',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
