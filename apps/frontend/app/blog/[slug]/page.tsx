import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { blogPosts } from "@/data/rdp"
export function generateStaticParams() { return blogPosts.map(post => ({ slug: post.slug })) }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const post = blogPosts.find(item => item.slug === slug); if (!post) notFound(); return <SiteShell><Container className="max-w-3xl py-16 sm:py-24"><Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All field notes</Link><p className="mt-12 font-mono text-xs uppercase tracking-[0.25em] text-accent">{post.category} · {post.date}</p><h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">{post.title}</h1><div className="mt-10 flex flex-col gap-6 text-lg leading-relaxed text-muted-foreground"><p>{post.excerpt}</p><p>For a reliable workflow, start with the route. Choose an India location close to your network, keep your workspace persistent, and test the connection before a high-demand booking window.</p><p>IRCTC RDP is designed around that simple operational loop: measure, deploy, connect, and stay ready.</p></div></Container></SiteShell> }
