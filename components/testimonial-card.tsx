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
        "flex h-full flex-col justify-between rounded-xl border border-border bg-card p-6",
        className
      )}
    >
      <blockquote className="text-pretty text-base leading-relaxed text-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
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
