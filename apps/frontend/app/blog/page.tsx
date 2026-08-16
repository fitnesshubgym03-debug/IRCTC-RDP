import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { blogPosts } from "@/data/rdp"
export const metadata = { title: "Blog" }
export default function Page() { return <SiteShell><Container className="py-16 sm:py-24"><p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">FIELD NOTES / IRCTC RDP</p><h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-7xl">Practical notes for faster remote workflows.</h1><div className="mt-12 grid gap-5 md:grid-cols-3">{blogPosts.map(post => <article key={post.slug} className="glass glass-hover rounded-2xl p-6"><p className="font-mono text-xs text-accent">{post.category} · {post.date}</p><h2 className="mt-6 text-2xl font-semibold leading-tight">{post.title}</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm text-accent">Read article <ArrowRight className="size-4" /></Link></article>)}</div></Container></SiteShell> }
