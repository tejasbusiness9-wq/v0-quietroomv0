"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { DataRefreshProvider } from "@/contexts/data-refresh-context"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased`}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="fixed inset-0 bg-background -z-10" />
        <DataRefreshProvider>{children}</DataRefreshProvider>
        <Analytics />
      </body>
    </html>
  )
}
