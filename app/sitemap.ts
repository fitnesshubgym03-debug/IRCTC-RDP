import type { MetadataRoute } from "next"
import { siteConfig } from "@/data/site"

const routes = [
  "",
  "/vps",
  "/cloud",
  "/dedicated",
  "/configure",
  "/pricing",
  "/features",
  "/infrastructure",
  "/about",
  "/contact",
  "/faq",
  "/support",
  "/status",
  "/compliance",
  "/abuse",
  "/login",
  "/register",
  "/legal/terms",
  "/legal/privacy",
  "/legal/refund",
  "/legal/sla",
  "/legal/aup",
  "/legal/kyc",
  "/legal/cookies",
  "/legal/disclaimer",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return routes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }))
}
