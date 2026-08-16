import Image from "next/image"
import { cn } from "@/lib/utils"

export type CpuBrand = "Intel" | "Ryzen"

const LOGOS: Record<CpuBrand, { src: string; alt: string; width: number; height: number }> = {
  // Transparent, tightly-cropped horizontal wordmark lockups.
  Intel: { src: "/logos/intel-xeon.png", alt: "Intel Xeon logo", width: 865, height: 247 },
  Ryzen: { src: "/logos/amd-ryzen.png", alt: "AMD Ryzen logo", width: 936, height: 202 },
}

/**
 * Renders a CPU platform logo as a bare transparent image.
 * No background, border, shadow, or padding is applied to the image itself.
 * Size it by height via the `className` prop; width follows the original
 * aspect ratio and `object-contain` guarantees it is never stretched.
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
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={cn("w-auto select-none object-contain", className)}
    />
  )
}
