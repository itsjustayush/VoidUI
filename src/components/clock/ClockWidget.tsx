import React, { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { getDateTimeInfo, pad2 } from '../../utils/datetime'

export const ClockWidget: React.FC = () => {
  const clockStyle = useStore((s) => s.clockStyle)
  const clockFormat24 = useStore((s) => s.clockFormat24)
  const showSeconds = useStore((s) => s.showSeconds)
  const weatherData = useStore((s) => s.weatherData)

  const [time, setTime] = useState(getDateTimeInfo(new Date(), clockFormat24))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getDateTimeInfo(new Date(), clockFormat24))
    }, 1000)
    return () => clearInterval(timer)
  }, [clockFormat24])

  // =========================================================================
  // 1. NOTHING OS DOT MATRIX CLOCK
  // =========================================================================
  if (clockStyle === 'dot-matrix') {
    return (
      <div className="flex flex-col gap-3 select-none">
        {/* Time Card */}
        <div className="void-card p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Subtle Glyph outline accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-nothing-red/5 rounded-full blur-2xl pointer-events-none group-hover:bg-nothing-red/10 transition-all duration-500" />

          {/* Time digits */}
          <div className="flex items-center justify-center gap-1.5 font-ndot text-6xl sm:text-7xl lg:text-8xl tracking-tight text-white/95">
            <span>{pad2(time.hours)}</span>
            <span className="text-nothing-red animate-pulse-subtle">:</span>
            <span>{pad2(time.minutes)}</span>
            {showSeconds && (
              <>
                <span className="text-nothing-red text-4xl sm:text-5xl opacity-60">:</span>
                <span className="text-4xl sm:text-5xl opacity-75 font-mono">{pad2(time.seconds)}</span>
              </>
            )}
            {!clockFormat24 && (
              <span className="text-xs font-mono font-semibold tracking-wider text-nothing-red self-start ml-1 mt-2">
                {time.ampm}
              </span>
            )}
          </div>

          {/* Greeting subtitle */}
          <div className="text-xs font-mono text-white/40 tracking-wider uppercase mt-1">
            {time.greeting} • {time.monthFull} {time.year}
          </div>
        </div>

        {/* Date Dual Split Pills */}
        <div className="grid grid-cols-2 gap-3">
          <div className="void-card py-3 px-4 flex items-center justify-center">
            <span className="font-ndot text-2xl uppercase tracking-wider text-white/90">
              {time.weekDayShort}
            </span>
          </div>
          <div className="rounded-squircle bg-nothing-red py-3 px-4 flex items-center justify-center shadow-glow-red">
            <span className="font-ntypeHead font-bold text-2xl text-white">
              {time.dayPadded}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 2. YOUNG SERIF EDITORIAL CLOCK (Requested by user)
  // =========================================================================
  if (clockStyle === 'young-serif') {
    return (
      <div className="void-card p-7 select-none relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        {/* Top meta */}
        <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-3">
          <span className="uppercase tracking-widest">{time.weekDayFull}</span>
          <span className="text-nothing-red font-semibold">{time.monthShort} {time.day}, {time.year}</span>
        </div>

        {/* Young Serif Hero Numerals */}
        <div className="my-3 flex items-baseline gap-2">
          <div className="font-young text-6xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-none">
            {pad2(time.hours)}:{pad2(time.minutes)}
          </div>
          {showSeconds && (
            <span className="font-mono text-xl text-white/50">{pad2(time.seconds)}</span>
          )}
          {!clockFormat24 && (
            <span className="font-young text-xl text-nothing-red italic ml-1">
              {time.ampm}
            </span>
          )}
        </div>

        {/* Editorial Footnote */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/40">
          <span className="font-serif italic text-white/60">"{time.greeting}, visionary."</span>
          <span className="font-mono text-[11px]">VOID / SERIF</span>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 3. ONEUI DUAL / INTEGRATED CLOCK WIDGET
  // =========================================================================
  if (clockStyle === 'oneui-dual') {
    return (
      <div className="void-card p-6 select-none flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-mono text-white/50 uppercase tracking-wider">
              {time.weekDayFull}, {time.monthShort} {time.day}
            </div>
            <div className="text-5xl sm:text-6xl font-sans font-bold tracking-tight text-white mt-1">
              {pad2(time.hours)}:{pad2(time.minutes)}
              {!clockFormat24 && (
                <span className="text-sm font-normal text-white/60 ml-1.5 uppercase">
                  {time.ampm}
                </span>
              )}
            </div>
          </div>

          {/* OneUI Squircle Badge */}
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-mono text-nothing-red font-bold">
              {time.weekDayShort}
            </span>
            <span className="text-base font-bold text-white">
              {time.day}
            </span>
          </div>
        </div>

        {/* OneUI status row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/60 font-sans">
          <span>{time.greeting}</span>
          {weatherData ? (
            <span className="text-white/80 font-medium">
              {weatherData.city} • {weatherData.temp}°{weatherData.condition}
            </span>
          ) : (
            <span className="text-white/40">VoidOS • Ready</span>
          )}
        </div>
      </div>
    )
  }

  // =========================================================================
  // 4. NOTHING ANALOGUE MINIMAL CLOCK
  // =========================================================================
  const secAngle = (time.seconds / 60) * 360
  const minAngle = ((time.minutes + time.seconds / 60) / 60) * 360
  const hourAngle = (((time.hours % 12) + time.minutes / 60) / 12) * 360

  return (
    <div className="void-card p-6 select-none flex flex-col items-center justify-center gap-3">
      {/* Clock Dial */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center shadow-inner">
        {/* 12 Hour tick dots */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const r = 80 // radius
          const x = Math.sin(angle) * r
          const y = -Math.cos(angle) * r
          const isQuarter = i % 3 === 0

          return (
            <div
              key={i}
              className={`absolute rounded-full transition-colors ${
                isQuarter ? 'w-2 h-2 bg-white/80' : 'w-1 h-1 bg-white/30'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            />
          )
        })}

        {/* Hour Hand */}
        <div
          className="absolute w-1.5 h-14 bg-white rounded-full origin-bottom shadow-md"
          style={{
            bottom: '50%',
            transform: `rotate(${hourAngle}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-1 h-20 bg-white/90 rounded-full origin-bottom shadow-md"
          style={{
            bottom: '50%',
            transform: `rotate(${minAngle}deg)`,
            transition: 'transform 0.1s linear',
          }}
        />

        {/* Nothing Red Second Hand */}
        <div
          className="absolute w-0.5 h-22 bg-nothing-red rounded-full origin-bottom shadow-[0_0_8px_rgba(215,25,33,0.8)]"
          style={{
            bottom: '50%',
            transform: `rotate(${secAngle}deg)`,
          }}
        />

        {/* Center Pivot Point */}
        <div className="absolute w-3 h-3 rounded-full bg-nothing-red z-10 border-2 border-[#121215]" />
      </div>

      {/* Digital Companion text */}
      <div className="flex items-center gap-2 font-mono text-xs text-white/60">
        <span className="font-ndot text-sm text-white/90 uppercase">{time.weekDayShort}</span>
        <span>•</span>
        <span>{pad2(time.hours)}:{pad2(time.minutes)}</span>
        <span className="text-nothing-red font-bold">{time.dayPadded} {time.monthShort}</span>
      </div>
    </div>
  )
}

