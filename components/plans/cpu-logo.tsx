import Image from "next/image"
import { cn } from "@/lib/utils"

export type CpuBrand = "Intel" | "Ryzen"

const LOGOS: Record<CpuBrand, { src: string; alt: string }> = {
  Intel: { src: "/logos/intel-xeon.png", alt: "Intel Xeon processor logo" },
  Ryzen: { src: "/logos/amd-ryzen.png", alt: "AMD Ryzen processor logo" },
}

/**
 * Renders an official CPU platform logo.
 * The source assets ship with transparent padding, so we size by height and
 * let `object-contain` preserve the original aspect ratio (never stretched).
 * The visible box height is controlled entirely via the `className` prop.
 */
export function CpuLogo({
  brand,
  className,
  priority = false,
}: {
  brand: CpuBrand
  className?: string
  priority?: boolean
}) {
  const logo = LOGOS[brand]
  return (
    <Image
      src={logo.src || "/placeholder.svg"}
      alt={logo.alt}
      width={512}
      height={512}
      priority={priority}
      className={cn("w-auto select-none object-contain", className)}
    />
  )
}
