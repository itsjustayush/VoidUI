import React, { useState, useEffect } from 'react'
import {
  Settings,
  Maximize2,
  Minimize2,
  Terminal,
  Battery,
  BatteryCharging,
  Wifi,
  Zap,
  Cpu,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { WORKSPACE_PRESETS } from '../../utils/constants'
import { getDateTimeInfo } from '../../utils/datetime'

interface BatteryStatus {
  level: number
  charging: boolean
  isDesktop?: boolean
}

export const HyprlandBar: React.FC = () => {
  const activeWorkspace = useStore((s) => s.activeWorkspace)
  const setActiveWorkspace = useStore((s) => s.setActiveWorkspace)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen)
  const weatherData = useStore((s) => s.weatherData)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [battery, setBattery] = useState<BatteryStatus>({
    level: 100,
    charging: true,
    isDesktop: false,
  })
  const [hasBatteryApi, setHasBatteryApi] = useState(false)
  const [powerPillMode, setPowerPillMode] = useState<'battery' | 'ram'>('battery')
  const [ramUsage, setRamUsage] = useState<number | null>(null)
  const [timeInfo, setTimeInfo] = useState(getDateTimeInfo())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getDateTimeInfo())
      // Check RAM if supported
      if (typeof window !== 'undefined' && (performance as any)?.memory) {
        const mem = (performance as any).memory
        setRamUsage(Math.round(mem.usedJSHeapSize / (1024 * 1024)))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Battery Status API (with Desktop fallback)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // @ts-expect-error Battery API
      navigator.getBattery()
        .then((batt: any) => {
          setHasBatteryApi(true)
          const updateBatt = () => {
            // Check if desktop without actual battery (often reports charging=true, level=1.0)
            const isDesktop = batt.chargingTime === 0 && batt.dischargingTime === Infinity && batt.level === 1
            setBattery({
              level: Math.round(batt.level * 100),
              charging: batt.charging,
              isDesktop,
            })
          }
          updateBatt()
          batt.addEventListener('levelchange', updateBatt)
          batt.addEventListener('chargingchange', updateBatt)
        })
        .catch(() => {
          setHasBatteryApi(false)
        })
    } else {
      setHasBatteryApi(false)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { })
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { })
    }
  }

  // Battery color status
  const getBatteryColor = () => {
    if (battery.charging) return 'text-caelestia-emerald'
    if (battery.level > 50) return 'text-caelestia-emerald'
    if (battery.level > 20) return 'text-amber-400'
    return 'text-nothing-red animate-pulse'
  }

  return (
    <header className="w-full max-w-7xl mx-auto pt-3 px-4 flex items-center justify-between select-none z-30">
      {/* Left: Brand mark & Workspaces */}
      <div className="flex items-center gap-2.5">
        {/* Brand Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-void-card border border-white/10 backdrop-blur-md shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-nothing-red animate-pulse-subtle shadow-[0_0_8px_rgba(215,25,33,0.8)]" />
          <span className="font-ndot tracking-wider text-xs uppercase text-white/90">VOID.UI</span>
        </div>

        {/* Hyprland Caelestia Workspace Switcher */}
        <div className="flex items-center p-1 rounded-full bg-void-card border border-white/10 backdrop-blur-md">
          {WORKSPACE_PRESETS.map((ws) => {
            const isActive = activeWorkspace === ws.id
            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                title={`${ws.name} (${ws.tag})`}
                className={`group relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 ${isActive
                    ? 'bg-white/15 text-white shadow-sm font-semibold'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-nothing-red scale-125' : 'bg-white/30 group-hover:bg-white/60'
                  }`} />
                <span>{ws.id}</span>
                <span className="hidden md:inline text-[11px] font-sans opacity-75">{ws.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Center: Active HUD Pill */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-void-card border border-white/10 backdrop-blur-md text-xs font-mono text-white/70">
        <span className="text-nothing-red font-ndot uppercase">{timeInfo.weekDayShort}</span>
        <span className="text-white/30">/</span>
        <span>{timeInfo.dayPadded} {timeInfo.monthShort}</span>
        {weatherData && (
          <>
            <span className="text-white/30">/</span>
            <span className="text-white/90 font-sans">{weatherData.temp}° {weatherData.city}</span>
          </>
        )}
      </div>

      {/* Right: System Status & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Power / Battery / RAM Pill */}
        <button
          onClick={() => setPowerPillMode((prev) => (prev === 'battery' ? 'ram' : 'battery'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void-card border border-white/10 hover:border-white/20 backdrop-blur-md text-xs font-mono text-white/80 transition-all cursor-pointer"
          title="Click to toggle Power / RAM info"
        >
          {powerPillMode === 'battery' ? (
            hasBatteryApi && !battery.isDesktop ? (
              <>
                {battery.charging ? (
                  <BatteryCharging className={`w-3.5 h-3.5 ${getBatteryColor()} animate-pulse`} />
                ) : (
                  <Battery className={`w-3.5 h-3.5 ${getBatteryColor()}`} />
                )}
                <span>{battery.level}%</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-caelestia-emerald" />
                <span>AC PWR</span>
              </>
            )
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-caelestia-cyan" />
              <span>{ramUsage ? `${ramUsage}MB` : 'SYS OK'}</span>
            </>
          )}
        </button>

        {/* Wifi / Online badge */}
        <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-full bg-void-card border border-white/10 backdrop-blur-md text-white/70">
          <Wifi className="w-3.5 h-3.5 text-caelestia-cyan" />
        </div>

        {/* Caelestia Fuzzel / Command Runner button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void-card border border-white/10 hover:border-white/20 backdrop-blur-md text-xs font-mono text-white/70 hover:text-white transition-all shadow-sm"
          title="Open Launcher (Ctrl+K)"
        >
          <Terminal className="w-3.5 h-3.5 text-nothing-red" />
          <span className="hidden sm:inline">Runner</span>
          <kbd className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-white/50">⌘K</kbd>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full bg-void-card border border-white/10 hover:border-white/20 backdrop-blur-md text-white/60 hover:text-white transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded-full bg-void-card border border-white/10 hover:border-white/20 backdrop-blur-md text-white/60 hover:text-white transition-all group"
          title="VoidUI Settings"
        >
          <Settings className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
        </button>
      </div>
    </header>
  )
}
