import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
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
  metadataBase: new URL("https://zwscloud.example"),
  title: {
    default: "ZWS Cloud — Premium VPS & Cloud Hosting",
    template: "%s · ZWS Cloud",
  },
  description:
    "ZWS Cloud delivers high-performance VPS, cloud hosting, and custom infrastructure with NVMe storage, DDoS protection, and transparent pricing.",
  keywords: [
    "VPS hosting",
    "cloud hosting",
    "dedicated servers",
    "NVMe VPS",
    "ZWS Cloud",
    "managed hosting",
  ],
  authors: [{ name: "ZWS Cloud" }],
  openGraph: {
    title: "ZWS Cloud — Premium VPS & Cloud Hosting",
    description:
      "High-performance VPS, cloud hosting, and custom infrastructure with transparent pricing.",
    type: "website",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
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
        {children}
        <Toaster />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
