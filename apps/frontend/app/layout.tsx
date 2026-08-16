import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { DotGridBackground } from "@/components/effects/dot-grid-background"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://irctcrdp.com"),
  title: {
    default: "IRCTC RDP — High-Speed Remote Desktop Infrastructure",
    template: "%s · IRCTC RDP",
  },
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IRCTC_logo_PNG1-Ifdl4ScjnTSU4PskJgzU9yxL097lVC.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IRCTC_logo_PNG1-Ifdl4ScjnTSU4PskJgzU9yxL097lVC.png",
  },
  description:
    "Fast, reliable RDP infrastructure for railway booking workflows, remote operations, and always-on access.",
  keywords: [
    "IRCTC RDP",
    "railway booking RDP",
    "India RDP",
    "low latency RDP",
    "remote desktop hosting",
  ],
  authors: [{ name: "IRCTC RDP" }],
  openGraph: {
    title: "IRCTC RDP — Fast Remote Booking Infrastructure",
    description:
      "Fast, reliable RDP infrastructure with India locations, NVMe storage, and 24/7 support.",
    type: "website",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#070b13",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {/* Full-screen interactive dot field (fixed, pointer-events-none) */}
        <DotGridBackground />
        {/* App content renders above the background */}
        <div className="relative z-10">{children}</div>
        <Toaster />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
