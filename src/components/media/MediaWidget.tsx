import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc } from 'lucide-react'

interface SoundTrack {
  id: string
  title: string
  artist: string
  mood: string
  type: 'rain' | 'space' | 'vinyl' | 'focus'
}

const TRACKS: SoundTrack[] = [
  { id: '1', title: 'Rain over Night City', artist: 'Void Synth', mood: 'Cyberpunk Lo-Fi', type: 'rain' },
  { id: '2', title: 'Celestia Nebula', artist: 'Hyprland Core', mood: 'Deep Space Drone', type: 'space' },
  { id: '3', title: 'Vintage Vinyl Whispers', artist: 'Analog 1982', mood: 'Cozy Vinyl', type: 'vinyl' },
  { id: '4', title: 'Neural Flow', artist: 'VoidOS Engine', mood: 'Pink Noise Focus', type: 'focus' },
]

export const MediaWidget: React.FC = () => {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<any[]>([])

  const currentTrack = TRACKS[currentTrackIdx]

  // Synthesize ambient sound using Web Audio API
  const startSound = (type: SoundTrack['type']) => {
    stopSound()
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    audioCtxRef.current = ctx

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime)
    masterGain.connect(ctx.destination)
    nodesRef.current.push(masterGain)

    if (type === 'rain' || type === 'focus') {
      // White/pink noise buffer generator
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08
        b6 = white * 0.115926
      }
      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      // Filter for soothing rain or focus tone
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(type === 'rain' ? 850 : 1200, ctx.currentTime)

      whiteNoise.connect(filter)
      filter.connect(masterGain)
      whiteNoise.start()
      nodesRef.current.push(whiteNoise, filter)
    } else if (type === 'space') {
      // Binaural cosmic chord drone
      const freqs = [110, 164.81, 220, 277.18] // A minor 7 chord
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime)

        const oscGain = ctx.createGain()
        oscGain.gain.setValueAtTime(0.08, ctx.currentTime)

        // Subtle LFO modulation
        const lfo = ctx.createOscillator()
        lfo.frequency.setValueAtTime(0.15 + Math.random() * 0.1, ctx.currentTime)
        const lfoGain = ctx.createGain()
        lfoGain.gain.setValueAtTime(4, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)

        osc.connect(oscGain)
        oscGain.connect(masterGain)

        osc.start()
        lfo.start()
        nodesRef.current.push(osc, oscGain, lfo, lfoGain)
      })
    } else if (type === 'vinyl') {
      // Warm vinyl ambient texture
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(65.41, ctx.currentTime) // Low C

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(350, ctx.currentTime)

      osc.connect(filter)
      filter.connect(masterGain)
      osc.start()
      nodesRef.current.push(osc, filter)
    }
  }

  const stopSound = () => {
    nodesRef.current.forEach((n) => {
      try {
        if (n.stop) n.stop()
        if (n.disconnect) n.disconnect()
      } catch {}
    })
    nodesRef.current = []
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      stopSound()
      setIsPlaying(false)
    } else {
      startSound(currentTrack.type)
      setIsPlaying(true)
    }
  }

  const handleNext = () => {
    const nextIdx = (currentTrackIdx + 1) % TRACKS.length
    setCurrentTrackIdx(nextIdx)
    if (isPlaying) {
      startSound(TRACKS[nextIdx].type)
    }
  }

  const handlePrev = () => {
    const prevIdx = (currentTrackIdx - 1 + TRACKS.length) % TRACKS.length
    setCurrentTrackIdx(prevIdx)
    if (isPlaying) {
      startSound(TRACKS[prevIdx].type)
    }
  }

  // Update volume
  useEffect(() => {
    if (nodesRef.current[0]) {
      nodesRef.current[0].gain.setValueAtTime(volume * 0.4, audioCtxRef.current?.currentTime || 0)
    }
  }, [volume])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSound()
  }, [])

  return (
    <div className="void-card p-5 select-none flex flex-col justify-between group">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <Disc className={`w-3.5 h-3.5 text-nothing-red ${isPlaying ? 'animate-spin' : ''}`} />
          <span className="font-ndot uppercase tracking-wider text-white/90">AMBIENT PLAYER</span>
        </div>
        <span className="text-[10px] text-white/40">{currentTrack.mood}</span>
      </div>

      {/* Middle Track Info & Visualizer */}
      <div className="flex items-center gap-4 my-2">
        {/* Album Art Squircle */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-void-850 to-void-700 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-md shrink-0">
          <div className="absolute inset-0 bg-nothing-red/10 animate-pulse" />
          <Disc className={`w-7 h-7 text-white/80 transition-transform ${isPlaying ? 'rotate-45' : ''}`} />
        </div>

        {/* Track Title & Artist */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-sans font-semibold text-white truncate">
            {currentTrack.title}
          </div>
          <div className="text-xs font-mono text-white/50 truncate mt-0.5">
            {currentTrack.artist}
          </div>

          {/* Equalizer Waveform bars */}
          <div className="flex items-end gap-1 h-3 mt-2">
            {[14, 28, 42, 60, 35, 75, 48, 20].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-nothing-red transition-all duration-300"
                style={{
                  height: isPlaying ? `${Math.max(4, (h * (Math.sin(Date.now() / 200 + i) + 1.2)) / 2)}px` : '3px',
                  opacity: isPlaying ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls & Volume */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Previous"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-nothing-red hover:bg-nothing-red-bright text-white shadow-glow-red transition-all transform hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play ambient soundscape'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Next"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-white/40" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-white/20 rounded-full appearance-none accent-nothing-red cursor-pointer"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>
    </div>
  )
}

