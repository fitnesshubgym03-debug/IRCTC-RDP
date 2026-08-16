export const rdpPlans = [
  { id: "starter", name: "Signal Starter", price: 499, ram: "4 GB", cpu: "2 vCPU", storage: "60 GB NVMe", bandwidth: "1 TB", location: "Mumbai", badge: "Fast entry" },
  { id: "express", name: "Express Desk", price: 899, ram: "8 GB", cpu: "4 vCPU", storage: "100 GB NVMe", bandwidth: "3 TB", location: "Delhi", badge: "Most booked" },
  { id: "premium", name: "Priority Cabin", price: 1499, ram: "16 GB", cpu: "6 vCPU", storage: "180 GB NVMe", bandwidth: "6 TB", location: "Mumbai", badge: "Power user" },
]

export const locations = [
  { city: "Mumbai", code: "BOM-01", latency: "8–14 ms", status: "Operational" },
  { city: "Delhi", code: "DEL-01", latency: "12–19 ms", status: "Operational" },
  { city: "Bengaluru", code: "BLR-01", latency: "18–26 ms", status: "Operational" },
  { city: "Hyderabad", code: "HYD-01", latency: "20–29 ms", status: "Operational" },
]

export const blogPosts = [
  { slug: "how-to-choose-rdp-for-irctc", title: "How to choose an RDP for IRCTC workflows", excerpt: "A practical guide to latency, browser stability, and session persistence.", date: "Aug 12, 2026", category: "Guides" },
  { slug: "why-location-matters", title: "Why RDP location matters for railway booking", excerpt: "Understand network distance, jitter, and why the closest node usually wins.", date: "Aug 06, 2026", category: "Network" },
  { slug: "keep-your-session-ready", title: "Keep your remote session ready for peak windows", excerpt: "A short operational checklist for busy booking days.", date: "Jul 29, 2026", category: "Operations" },
]
