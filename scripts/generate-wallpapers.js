import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const wpDir = path.resolve(__dirname, '../public/wallpapers')
if (!fs.existsSync(wpDir)) fs.mkdirSync(wpDir, { recursive: true })

// 1. Caelestia Cyber (CachyOS Hyprland Aurora)
const celestiaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="aurora1" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.22" />
      <stop offset="60%" stop-color="#07090e" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora2" cx="80%" cy="70%" r="65%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#07090e" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora3" cx="50%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#d71921" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#07090e" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1" />
    </pattern>
  </defs>

  <rect width="1920" height="1080" fill="#06080d" />
  <rect width="1920" height="1080" fill="url(#aurora1)" />
  <rect width="1920" height="1080" fill="url(#aurora2)" />
  <rect width="1920" height="1080" fill="url(#aurora3)" />
  <rect width="1920" height="1080" fill="url(#grid)" />

  <!-- Abstract Hyprland Caelestia Geometry -->
  <circle cx="960" cy="540" r="320" fill="none" stroke="rgba(0, 242, 254, 0.08)" stroke-width="1.5" stroke-dasharray="4 8" />
  <circle cx="960" cy="540" r="440" fill="none" stroke="rgba(168, 85, 247, 0.06)" stroke-width="1" />
</svg>`

// 2. Nothing Topography (Iconic Nothing OS Contours)
const nothingTopoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bgNothing" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#141416" />
      <stop offset="100%" stop-color="#070709" />
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bgNothing)" />

  <!-- Dotted Matrix Ambient Overlay -->
  <g fill="rgba(255, 255, 255, 0.04)">
    ${Array.from({ length: 48 }).map((_, i) =>
      Array.from({ length: 27 }).map((_, j) =>
        `<circle cx="${i * 40 + 20}" cy="${j * 40 + 20}" r="1" />`
      ).join('')
    ).join('')}
  </g>

  <!-- Nothing Topography Waves -->
  <path d="M-100,500 C400,300 800,700 1200,450 C1600,200 1800,600 2100,500" fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="2" />
  <path d="M-100,560 C400,360 800,760 1200,510 C1600,260 1800,660 2100,560" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.5" />
  <path d="M-100,620 C400,420 800,820 1200,570 C1600,320 1800,720 2100,620" fill="none" stroke="rgba(215, 25, 33, 0.25)" stroke-width="2" />
  <path d="M-100,680 C400,480 800,880 1200,630 C1600,380 1800,780 2100,680" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.5" />
</svg>`

// 3. Deep Void (Minimalist Nebula)
const deepVoidSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="centerVoid" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="70%" stop-color="#050508" />
      <stop offset="100%" stop-color="#0d0d12" />
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#centerVoid)" />
  <circle cx="960" cy="540" r="2" fill="#d71921" opacity="0.8" />
  <circle cx="960" cy="540" r="120" fill="none" stroke="rgba(215,25,33,0.15)" stroke-width="1" stroke-dasharray="2 6" />
</svg>`

fs.writeFileSync(path.join(wpDir, 'celestia-cyber.svg'), celestiaSvg.trim())
fs.writeFileSync(path.join(wpDir, 'nothing-topography.svg'), nothingTopoSvg.trim())
fs.writeFileSync(path.join(wpDir, 'deep-void.svg'), deepVoidSvg.trim())
console.log('✓ Wallpapers generated successfully!')

