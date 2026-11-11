import React, { useState, useEffect } from 'react'
import {
  Lightbulb,
  Zap,
  Activity,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../../store/useStore'

type GlyphMode = 'torch' | 'pulse' | 'interactive' | 'audioSync'

export const GlyphWidget: React.FC = () => {
  const minimized = useStore((s) => !!s.minimizedWidgets['glyph'])
  const toggleMinimized = useStore((s) => s.toggleWidgetMinimized)
  const isAmbientPlaying = useStore((s) => s.isAmbientPlaying)

  const [mode, setMode] = useState<GlyphMode>('torch')
  const [torchActive, setTorchActive] = useState<boolean>(true)
  const [activeSegments, setActiveSegments] = useState<Record<string, boolean>>({
    cameraRing: true,
    topSlash: true,
    centerRing: true,
    centerLine: true,
    bottomLine: true,
    bottomDot: true,
  })

  // Audio Sync reactive effect
  const [audioStrobe, setAudioStrobe] = useState<boolean>(false)
  useEffect(() => {
    if (mode !== 'audioSync' || !isAmbientPlaying) {
      setAudioStrobe(false)
      return
    }
    const interval = setInterval(() => {
      setAudioStrobe((prev) => !prev)
    }, 450)
    return () => clearInterval(interval)
  }, [mode, isAmbientPlaying])

  const toggleSegment = (seg: string) => {
    setActiveSegments((prev) => ({
      ...prev,
      [seg]: !prev[seg],
    }))
  }

  const toggleTorch = () => {
    const nextState = !torchActive
    setTorchActive(nextState)
    setActiveSegments({
      cameraRing: nextState,
      topSlash: nextState,
      centerRing: nextState,
      centerLine: nextState,
      bottomLine: nextState,
      bottomDot: nextState,
    })
  }

  // Calculate glow classes for segments
  const getSegmentGlow = (segKey: string) => {
    if (mode === 'torch' && !torchActive) return 'opacity-20 stroke-white/20 fill-white/10'
    if (mode === 'audioSync') {
      if (!isAmbientPlaying) return 'opacity-25 stroke-white/20 fill-white/10'
      return audioStrobe
        ? 'opacity-100 stroke-white fill-white filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]'
        : 'opacity-40 stroke-white/60 fill-white/40'
    }
    if (mode === 'pulse') {
      return 'opacity-90 stroke-white fill-white animate-pulse filter drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]'
    }
    // Interactive & Torch
    const isOn = activeSegments[segKey]
    return isOn
      ? 'opacity-100 stroke-white fill-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] cursor-pointer hover:scale-[1.02] transition-all'
      : 'opacity-15 stroke-white/20 fill-white/10 cursor-pointer hover:opacity-40 transition-all'
  }

  // Minimized Mode
  if (minimized) {
    return (
      <div className="void-card p-3 select-none flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Lightbulb
              className={`w-4 h-4 transition-colors ${torchActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/30'
                }`}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-ndot text-sm uppercase text-white tracking-wider">GLYPH // MATRIX</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                {torchActive ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-white/40 capitalize">{mode} mode</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTorch}
            className={`p-1.5 rounded-full transition-all ${torchActive ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            title="Toggle Torch"
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleMinimized('glyph')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Expand card"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="void-card p-5 select-none relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-nothing-red" />
          <span className="font-ndot uppercase tracking-wider text-white/90">
            NOTHING // GLYPH INTERFACE
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTorch}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all ${torchActive ? 'bg-white text-black font-semibold' : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            title="Toggle Torch"
          >
            TORCH
          </button>
          <button
            onClick={() => toggleMinimized('glyph')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Minimize card"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Pills */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 my-2 text-xs font-mono">
        <button
          onClick={() => {
            setMode('torch')
            setTorchActive(true)
          }}
          className={`py-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'torch' ? 'bg-white text-black font-medium' : 'text-white/50 hover:text-white'
            }`}
        >
          <Lightbulb className="w-3 h-3" />
          <span>Torch</span>
        </button>
        <button
          onClick={() => setMode('pulse')}
          className={`py-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'pulse' ? 'bg-nothing-red text-white font-medium' : 'text-white/50 hover:text-white'
            }`}
        >
          <Activity className="w-3 h-3" />
          <span>Pulse</span>
        </button>
        <button
          onClick={() => setMode('audioSync')}
          className={`py-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'audioSync' ? 'bg-caelestia-cyan/30 text-caelestia-cyan font-medium border border-caelestia-cyan/40' : 'text-white/50 hover:text-white'
            }`}
        >
          <Volume2 className="w-3 h-3" />
          <span>Audio</span>
        </button>
      </div>

      {/* SVG Glyph Visualizer */}
      <div className="flex items-center justify-center py-3 relative">
        <svg
          viewBox="0 0 240 260"
          className="w-44 h-48 sm:w-52 sm:h-56 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        >
          {/* Subtle Phone outline border */}
          <rect
            x="20"
            y="10"
            width="200"
            height="240"
            rx="28"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />

          {/* 1. Camera Ring (Upper Left) */}
          <g onClick={() => toggleSegment('cameraRing')} className="transition-all duration-200">
            <path
              d="M 50 36 C 85 36 95 45 95 80 C 95 115 85 124 50 124"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              className={getSegmentGlow('cameraRing')}
            />
          </g>

          {/* 2. Top-Right Diagonal Slash */}
          <g onClick={() => toggleSegment('topSlash')} className="transition-all duration-200">
            <path
              d="M 175 38 L 195 58"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              className={getSegmentGlow('topSlash')}
            />
          </g>

          {/* 3. Center Wireless Charging Big Ring */}
          <g onClick={() => toggleSegment('centerRing')} className="transition-all duration-200">
            <path
              d="M 120 75 A 48 48 0 1 1 119.9 75"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              className={getSegmentGlow('centerRing')}
            />
          </g>

          {/* 4. Center Horizontal Line */}
          <g onClick={() => toggleSegment('centerLine')} className="transition-all duration-200">
            <path
              d="M 180 125 L 205 125"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              className={getSegmentGlow('centerLine')}
            />
          </g>

          {/* 5. Bottom Exclamation Bar (Battery Charging Indicator) */}
          <g onClick={() => toggleSegment('bottomLine')} className="transition-all duration-200">
            <line
              x1="120"
              y1="195"
              x2="120"
              y2="218"
              strokeWidth="5"
              strokeLinecap="round"
              className={getSegmentGlow('bottomLine')}
            />
          </g>

          {/* 6. Bottom Exclamation Dot */}
          <g onClick={() => toggleSegment('bottomDot')} className="transition-all duration-200">
            <circle
              cx="120"
              cy="232"
              r="3.5"
              className={getSegmentGlow('bottomDot')}
            />
          </g>

          {/* Red Recording Indicator LED */}
          <circle
            cx="195"
            cy="40"
            r="2"
            fill="#d71921"
            className="animate-pulse shadow-[0_0_6px_#d71921]"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/5">
        <span>Click strips to toggle</span>
        <span className="uppercase text-nothing-red font-semibold">
          {mode === 'audioSync'
            ? isAmbientPlaying
              ? 'AUDIO REACTIVE ACTIVE'
              : 'IDLE (START LO-FI)'
            : `${mode} MODE`}
        </span>
      </div>
    </div>
  )
}
