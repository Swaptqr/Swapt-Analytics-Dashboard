import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Swapt",
  description: "Swapt Analytics Dashboard",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        url: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/swapt-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/swapt-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}


import './globals.css'