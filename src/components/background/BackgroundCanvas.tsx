import React, { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const background = useStore((s) => s.background)
  const customBgUrl = useStore((s) => s.customBgUrl)
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    if (background === 'oled') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    let mouseX = -1000
    let mouseY = -1000
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Dot grid configuration
    const spacing = 28
    const cols = Math.ceil(width / spacing)
    const rows = Math.ceil(height / spacing)

    let time = 0

    const render = () => {
      time += 0.015
      ctx.clearRect(0, 0, width, height)

      if (background === 'dot-matrix') {
        const isLight = theme === 'light'
        const baseAlpha = isLight ? 0.08 : 0.12
        const isCaelestia = theme === 'caelestia'
        const isViolet = theme === 'violet'

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = i * spacing
            const y = j * spacing
            const dx = mouseX - x
            const dy = mouseY - y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const maxDist = 180

            let radius = 1.2
            let alpha = baseAlpha

            if (dist < maxDist) {
              const factor = (1 - dist / maxDist)
              radius = 1.2 + factor * 2
              alpha = baseAlpha + factor * 0.6
            }

            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)

            if (dist < maxDist) {
              if (isCaelestia) {
                ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`
              } else if (isViolet) {
                ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`
              } else {
                ctx.fillStyle = isLight ? `rgba(215, 25, 33, ${alpha})` : `rgba(215, 25, 33, ${alpha})`
              }
            } else {
              ctx.fillStyle = isLight ? `rgba(0, 0, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`
            }

            ctx.fill()
          }
        }
      } else if (background === 'caelestia-mesh') {
        // Dynamic glowing organic aurora mesh
        const grad1 = ctx.createRadialGradient(
          width * 0.25 + Math.sin(time * 0.5) * 120,
          height * 0.35 + Math.cos(time * 0.4) * 80,
          10,
          width * 0.25,
          height * 0.35,
          width * 0.55
        )
        grad1.addColorStop(0, 'rgba(0, 242, 254, 0.12)')
        grad1.addColorStop(1, 'transparent')

        const grad2 = ctx.createRadialGradient(
          width * 0.75 + Math.cos(time * 0.4) * 140,
          height * 0.65 + Math.sin(time * 0.5) * 90,
          10,
          width * 0.75,
          height * 0.65,
          width * 0.55
        )
        grad2.addColorStop(0, 'rgba(168, 85, 247, 0.14)')
        grad2.addColorStop(1, 'transparent')

        ctx.fillStyle = grad1
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = grad2
        ctx.fillRect(0, 0, width, height)
      } else if (background === 'starry') {
        // Floating subtle stardust
        for (let i = 0; i < 40; i++) {
          const sx = ((i * 137.5 + time * (i % 3 + 1) * 8) % width)
          const sy = ((i * 243.7 + Math.sin(time * 0.2 + i) * 30) % height)
          const r = (i % 3) * 0.8 + 0.8
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + (Math.sin(time + i) + 1) * 0.2})`
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [background, theme])

  if (background === 'custom' && customBgUrl) {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${customBgUrl})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>
    )
  }

  if (background === 'oled') {
    return <div className="fixed inset-0 pointer-events-none -z-10 bg-black" />
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 transition-opacity duration-500"
    />
  )
}

