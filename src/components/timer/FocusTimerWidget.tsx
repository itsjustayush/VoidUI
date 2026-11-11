import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Coffee,
  Brain,
} from 'lucide-react'
import { useStore } from '../../store/useStore'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

// Synthesize pleasant ambient chime with Web Audio API
function playCompletionChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start)

      gain.gain.setValueAtTime(0.001, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    // 3 harmonic ascending chimes (E5, G#5, B5, E6)
    playTone(659.25, 0.0, 0.6)
    playTone(830.61, 0.15, 0.7)
    playTone(987.77, 0.3, 0.8)
    playTone(1318.51, 0.45, 1.2)
  } catch (err) {
    console.warn('Audio chime could not play:', err)
  }
}

export const FocusTimerWidget: React.FC = () => {
  const minimized = useStore((s) => !!s.minimizedWidgets['timer'])
  const toggleMinimized = useStore((s) => s.toggleWidgetMinimized)

  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0)

  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setIsRunning(false)
            playCompletionChime()
            if (mode === 'focus') {
              setSessionsCompleted((s) => s + 1)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, mode])

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(MODE_DURATIONS[newMode])
  }

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(MODE_DURATIONS[mode])
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(MODE_DURATIONS[mode])
  }

  const totalDuration = MODE_DURATIONS[mode]
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Minimized Pill Mode (Dynamic Tiling)
  if (minimized) {
    return (
      <div className="void-card p-3 select-none flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            {mode === 'focus' ? (
              <Brain className={`w-4 h-4 ${isRunning ? 'text-nothing-red animate-pulse' : 'text-white/60'}`} />
            ) : (
              <Coffee className="w-4 h-4 text-caelestia-emerald" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-ndot text-lg text-white font-bold">{formattedTime}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                {mode === 'focus' ? 'FOCUS' : 'BREAK'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-white/40">
              {sessionsCompleted} session{sessionsCompleted === 1 ? '' : 's'} done
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTimer}
            className={`p-1.5 rounded-full transition-all ${
              isRunning ? 'bg-nothing-red/20 text-nothing-red' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <button
            onClick={() => toggleMinimized('timer')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Expand card"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // Expanded Full Widget
  return (
    <div className="void-card p-5 select-none relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-nothing-red animate-pulse' : 'bg-white/30'}`} />
          <span className="font-ndot tracking-wider uppercase text-white/90">ZEN FOCUS // TIMER</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-white/40 mr-1">
            {sessionsCompleted} completed
          </span>
          <button
            onClick={resetTimer}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleMinimized('timer')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Minimize card"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/5 mb-4 text-xs font-mono">
        <button
          onClick={() => switchMode('focus')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'focus' ? 'bg-nothing-red text-white font-medium shadow-sm' : 'text-white/50 hover:text-white'
          }`}
        >
          <Brain className="w-3 h-3" />
          <span>25m Focus</span>
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'shortBreak' ? 'bg-caelestia-emerald/30 text-caelestia-emerald font-medium border border-caelestia-emerald/40' : 'text-white/50 hover:text-white'
          }`}
        >
          <Coffee className="w-3 h-3" />
          <span>5m Rest</span>
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'longBreak' ? 'bg-caelestia-cyan/30 text-caelestia-cyan font-medium border border-caelestia-cyan/40' : 'text-white/50 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>15m Zen</span>
        </button>
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <div className="font-ndot text-6xl sm:text-7xl tracking-tighter text-white font-bold select-all drop-shadow-md">
          {formattedTime}
        </div>

        {/* Progress Bar with Dot Matrix Pattern */}
        <div className="w-full mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              mode === 'focus' ? 'bg-nothing-red' : 'bg-caelestia-emerald'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="w-full flex justify-between items-center text-[10px] font-mono text-white/40 mt-1.5">
          <span>{progressPercent}% elapsed</span>
          <span>{timeLeft === 0 ? 'COMPLETED' : isRunning ? 'IN SESSION' : 'PAUSED'}</span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-white/5">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
            isRunning
              ? 'bg-nothing-red/20 text-nothing-red border border-nothing-red/40 hover:bg-nothing-red/30'
              : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE SESSION</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START {mode.toUpperCase()}</span>
            </>
          )}
        </button>

        <button
          onClick={playCompletionChime}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
          title="Test audio chime"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
