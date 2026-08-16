import sharp from "/vercel/share/v0-project/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js"
import { readFile, writeFile } from "node:fs/promises"

// Crop each wordmark lockup down to just its colored brand emblem
// (Intel blue circle / AMD orange arrow) by finding the bounding box of
// saturated (non-grayscale, non-white) pixels.
const jobs = [
  { src: "public/logos/intel-xeon.png", out: "public/logos/intel-emblem.png" },
  { src: "public/logos/amd-ryzen.png", out: "public/logos/amd-emblem.png" },
]

for (const { src, out } of jobs) {
  const buf = await readFile(src)
  const img = sharp(buf).ensureAlpha()
  const { width, height } = await img.metadata()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const ch = info.channels

  let minX = width, minY = height, maxX = -1, maxY = -1
  for (let i = 0; i < width * height; i++) {
    const a = data[i * ch + 3]
    if (a < 40) continue
    const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2]
    const sat = Math.max(r, g, b) - Math.min(r, g, b)
    if (sat < 40) continue // skip white wordmark + any residue
    const x = i % width, y = (i / width) | 0
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  // Include nearby white pixels that sit inside the emblem bounds (e.g. the
  // "intel" wordmark printed on the blue circle) by keeping the full box.
  const boxW = maxX - minX + 1
  const boxH = maxY - minY + 1
  const pad = Math.round(Math.max(boxW, boxH) * 0.06)
  const left = Math.max(0, minX - pad)
  const top = Math.max(0, minY - pad)
  const cropW = Math.min(width, maxX + pad + 1) - left
  const cropH = Math.min(height, maxY + pad + 1) - top

  const emblem = await sharp(buf).extract({ left, top, width: cropW, height: cropH }).png().toBuffer()
  await writeFile(out, emblem)
  console.log(`[v0] ${out} -> ${cropW}x${cropH} (from ${width}x${height})`)
}
