import { cn } from "@/lib/utils"

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  className,
}: {
  quote: string
  author: string
  role: string
  company: string
  className?: string
}) {
  return (
    <figure
      className={cn(
        "glass-card flex h-full flex-col justify-between rounded-2xl p-6",
        className
      )}
    >
      <blockquote className="text-pretty text-base leading-relaxed text-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/5 text-sm font-semibold text-foreground ring-1 ring-accent/30">
          {author.charAt(0)}
        </div>
        <div className="text-sm">
          <div className="font-medium text-foreground">{author}</div>
          <div className="text-muted-foreground">
            {role} · {company}
          </div>
        </div>
      </figcaption>
    </figure>
  )
}
