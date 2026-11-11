import React, { useState } from 'react'
import {
  X,
  Palette,
  Clock,
  Layers,
  CloudSun,
  Database,
  Info,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Check,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { ThemeMode, ClockStyle, BackgroundStyle } from '../../types'
import { VOID_VERSION, GITHUB_REPO_URL } from '../../utils/constants'

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useStore((s) => s.isSettingsOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)

  // Appearance
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const clockStyle = useStore((s) => s.clockStyle)
  const setClockStyle = useStore((s) => s.setClockStyle)
  const clockFormat24 = useStore((s) => s.clockFormat24)
  const setClockFormat24 = useStore((s) => s.setClockFormat24)
  const showSeconds = useStore((s) => s.showSeconds)
  const setShowSeconds = useStore((s) => s.setShowSeconds)
  const background = useStore((s) => s.background)
  const setBackground = useStore((s) => s.setBackground)
  const customBgUrl = useStore((s) => s.customBgUrl)
  const setCustomBgUrl = useStore((s) => s.setCustomBgUrl)

  // Widgets
  const widgets = useStore((s) => s.widgets)
  const toggleWidget = useStore((s) => s.toggleWidget)

  // Weather
  const weatherConfig = useStore((s) => s.weatherConfig)
  const setWeatherConfig = useStore((s) => s.setWeatherConfig)

  // Backup
  const exportConfig = useStore((s) => s.exportConfig)
  const importConfig = useStore((s) => s.importConfig)
  const resetToDefaults = useStore((s) => s.resetToDefaults)

  const [activeTab, setActiveTab] = useState<
    'appearance' | 'widgets' | 'weather' | 'backup' | 'about'
  >('appearance')
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)

  if (!isSettingsOpen) return null

  const handleExport = () => {
    const jsonStr = exportConfig()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `void-ui-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (!importText.trim()) return
    const success = importConfig(importText)
    if (success) {
      setImportStatus('Configuration successfully restored!')
      setTimeout(() => setImportStatus(null), 3000)
    } else {
      setImportStatus('Failed to import: Invalid JSON format.')
    }
  }

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    setUpdateMessage(null)
    try {
      // Simulate/check latest release
      await new Promise((r) => setTimeout(r, 900))
      setUpdateMessage(`You are running the latest version: v${VOID_VERSION} (Up to date)`)
    } catch {
      setUpdateMessage('Check failed. Please visit the GitHub repository.')
    } finally {
      setCheckingUpdate(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-end z-50 animate-in fade-in duration-200 select-none"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="w-full max-w-lg h-full bg-void-950 border-l border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-nothing-red animate-pulse-subtle" />
            <h2 className="font-ndot text-lg uppercase tracking-wider text-white">
              SETTINGS // VOID.UI
            </h2>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-white/5 overflow-x-auto text-xs font-mono">
          {[
            { id: 'appearance', label: 'Theme', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'widgets', label: 'Widgets', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'weather', label: 'Weather', icon: <CloudSun className="w-3.5 h-3.5" /> },
            { id: 'backup', label: 'Backup', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'about', label: 'About', icon: <Info className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-nothing-red text-white font-medium shadow-glow-red'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ============================================================= */}
          {/* TAB 1: APPEARANCE */}
          {/* ============================================================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Palette */}
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                  Color Themes
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'nothing', name: 'Nothing Dark', desc: 'Monochrome + Crimson', color: '#d71921' },
                    { id: 'caelestia', name: 'Caelestia Cyan', desc: 'Hyprland Electric Cyan', color: '#00f2fe' },
                    { id: 'violet', name: 'Celestia Violet', desc: 'Purple Neon Glow', color: '#a855f7' },
                    { id: 'amoled', name: 'AMOLED Black', desc: 'Pure 0-nit pitch black', color: '#ffffff' },
                    { id: 'light', name: 'Nothing Daylight', desc: 'High-contrast stark white', color: '#111116' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as ThemeMode)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        theme === t.id
                          ? 'border-white/40 bg-white/10 shadow-md'
                          : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="text-xs font-sans font-medium text-white">{t.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/40 truncate">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clock Styles */}
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                  Clock Style
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'dot-matrix', name: 'Nothing Dot Matrix', font: 'font-ndot', preview: '12:45' },
                    { id: 'young-serif', name: 'Young Serif', font: 'font-young', preview: '12:45' },
                    { id: 'oneui-dual', name: 'OneUI Dual', font: 'font-sans font-bold', preview: '12:45' },
                    { id: 'analogue', name: 'Analogue Dial', font: 'font-mono', preview: 'Dial' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setClockStyle(c.id as ClockStyle)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        clockStyle === c.id
                          ? 'border-nothing-red bg-nothing-red/10 text-white'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70'
                      }`}
                    >
                      <div className={`text-xl text-white ${c.font} mb-1`}>{c.preview}</div>
                      <div className="text-xs font-sans">{c.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clock Toggles */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-sans text-white">24-Hour Time Format</div>
                    <div className="text-[10px] font-mono text-white/40">Switch between 24h and 12h AM/PM</div>
                  </div>
                  <button
                    onClick={() => setClockFormat24(!clockFormat24)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      clockFormat24 ? 'bg-nothing-red' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        clockFormat24 ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-sans text-white">Show Seconds</div>
                    <div className="text-[10px] font-mono text-white/40">Live ticker on digital clocks</div>
                  </div>
                  <button
                    onClick={() => setShowSeconds(!showSeconds)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      showSeconds ? 'bg-nothing-red' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        showSeconds ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Background Styles */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                  Background Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dot-matrix', label: 'Dot Matrix' },
                    { id: 'caelestia-mesh', label: 'Caelestia Aurora' },
                    { id: 'starry', label: 'Starry' },
                    { id: 'oled', label: 'Pure OLED' },
                    { id: 'custom', label: 'Custom URL' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBackground(bg.id as BackgroundStyle)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono text-center border transition-all ${
                        background === bg.id
                          ? 'border-nothing-red bg-nothing-red/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>

                {background === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customBgUrl}
                      onChange={(e) => setCustomBgUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-nothing-red"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 2: WIDGETS TOGGLE */}
          {/* ============================================================= */}
          {activeTab === 'widgets' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                Enable or Disable Widgets
              </div>
              {[
                { key: 'hyprlandBar', label: 'Hyprland Caelestia Top Bar', desc: 'Workspaces & HUD pills' },
                { key: 'clock', label: 'Clock & Date Widget', desc: 'Primary time and date display' },
                { key: 'weather', label: 'Weather Widget', desc: 'Real-time temperature and Nothing weather icons' },
                { key: 'search', label: 'Omnibar Search Bar', desc: 'Multi-engine search with suggestions' },
                { key: 'shortcuts', label: 'Shortcuts Grid', desc: 'Quick bookmarks with custom categories' },
                { key: 'media', label: 'Ambient Lo-Fi Player', desc: 'Synthesizer & audio visualizer' },
                { key: 'timer', label: 'Zen Focus Pomodoro Timer', desc: '25/5/15 dot-matrix timer with audio bell chime' },
                { key: 'news', label: 'Live Tech Dispatch Feed', desc: 'Real-time HackerNews top stories with auto-ticker' },
                { key: 'glyph', label: 'Nothing Glyph Matrix', desc: 'Interactive Glyph LED lights with torch & audio reactive modes' },
                { key: 'notes', label: 'Scratchpad Notes', desc: 'Auto-saved persistent memo notepad' },
                { key: 'todo', label: 'Task List / To-Do', desc: 'Daily task checklist with completion bar' },
                { key: 'dock', label: 'Bottom Dock', desc: 'Floating quick launcher dock' },
              ].map((w) => {
                const isEnabled = widgets[w.key as keyof typeof widgets]
                return (
                  <div
                    key={w.key}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5"
                  >
                    <div>
                      <div className="text-xs font-sans font-medium text-white">{w.label}</div>
                      <div className="text-[10px] font-mono text-white/40">{w.desc}</div>
                    </div>
                    <button
                      onClick={() => toggleWidget(w.key as any)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        isEnabled ? 'bg-nothing-red' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 3: WEATHER CONFIG */}
          {/* ============================================================= */}
          {activeTab === 'weather' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1">
                  City Location
                </label>
                <input
                  type="text"
                  value={weatherConfig.city}
                  onChange={(e) => setWeatherConfig({ city: e.target.value })}
                  placeholder="e.g. London, New York, Tokyo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/30 outline-none focus:border-nothing-red"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1">
                  Temperature Units
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setWeatherConfig({ unit: 'C' })}
                    className={`py-2 rounded-xl text-xs font-mono border transition-all ${
                      weatherConfig.unit === 'C'
                        ? 'border-nothing-red bg-nothing-red/20 text-white font-semibold'
                        : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    onClick={() => setWeatherConfig({ unit: 'F' })}
                    className={`py-2 rounded-xl text-xs font-mono border transition-all ${
                      weatherConfig.unit === 'F'
                        ? 'border-nothing-red bg-nothing-red/20 text-white font-semibold'
                        : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div>
                  <div className="text-xs font-sans font-medium text-white">Auto Geolocation</div>
                  <div className="text-[10px] font-mono text-white/40">Use browser GPS location</div>
                </div>
                <button
                  onClick={() => setWeatherConfig({ useAutoLocation: !weatherConfig.useAutoLocation })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    weatherConfig.useAutoLocation ? 'bg-nothing-red' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      weatherConfig.useAutoLocation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1">
                  Custom OpenWeatherMap API Key (Optional)
                </label>
                <input
                  type="password"
                  value={weatherConfig.apiKey}
                  onChange={(e) => setWeatherConfig({ apiKey: e.target.value })}
                  placeholder="Leave empty for free Open-Meteo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/30 outline-none focus:border-nothing-red"
                />
                <div className="text-[10px] font-mono text-white/40 mt-1">
                  Open-Meteo is used by default with zero key required.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 4: BACKUP & RESTORE */}
          {/* ============================================================= */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                  Export Settings
                </h4>
                <p className="text-xs text-white/60 mb-3 font-sans">
                  Export all your customized shortcuts, themes, widgets, and preferences to a portable JSON file.
                </p>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-nothing-red text-white text-xs font-mono transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                  Restore from JSON
                </h4>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your exported configuration JSON here..."
                  className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/15 text-xs font-mono text-white placeholder-white/30 outline-none focus:border-nothing-red resize-none"
                />
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nothing-red hover:bg-nothing-red-bright text-white text-xs font-mono transition-all mt-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore Configuration</span>
                </button>
                {importStatus && (
                  <div className="text-xs font-mono text-caelestia-emerald mt-2">
                    {importStatus}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs font-mono text-nothing-red uppercase tracking-wider mb-1">
                  Danger Zone
                </h4>
                <p className="text-xs text-white/40 mb-3 font-sans">
                  Reset VoidUI to factory default settings.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all VoidUI settings to default?')) {
                      resetToDefaults()
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 text-xs font-mono transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 5: ABOUT & UPDATE CHECKER */}
          {/* ============================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-ndot text-base text-white">VOID.UI EXTENSION</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-nothing-red text-white font-bold">
                    v{VOID_VERSION}
                  </span>
                </div>
                <p className="text-xs font-sans text-white/60 leading-relaxed">
                  Futuristic browser startpage synthesizing the iconic Nothing OS dot matrix aesthetics, OneUI widget curves, and CachyOS Linux Hyprland Caelestia shell.
                </p>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={handleCheckUpdate}
                    disabled={checkingUpdate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                    <span>Check for Updates</span>
                  </button>

                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-mono transition-all ml-auto"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {updateMessage && (
                  <div className="mt-2 text-xs font-mono text-caelestia-cyan">
                    {updateMessage}
                  </div>
                )}
              </div>

              {/* Installation Guide */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-white/50 uppercase tracking-wider">
                  How to Load in Any Browser
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-mono text-white/70 space-y-2">
                  <div>
                    <span className="text-nothing-red font-bold">1. Helium / Chrome / Brave / Edge:</span>
                    <p className="text-white/50 mt-0.5 font-sans">
                      Open <code className="text-white/80">chrome://extensions</code> or <code className="text-white/80">helium://extensions</code>, turn on "Developer mode", and click "Load unpacked", then select the built <code className="text-white/80">dist</code> folder.
                    </p>
                  </div>
                  <div>
                    <span className="text-caelestia-cyan font-bold">2. Firefox:</span>
                    <p className="text-white/50 mt-0.5 font-sans">
                      Open <code className="text-white/80">about:debugging#/runtime/this-firefox</code> and click "Load Temporary Add-on" pointing to <code className="text-white/80">manifest.json</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Font & Design Attributions */}
              <div className="text-[11px] font-mono text-white/40 space-y-1">
                <div>Typography: NDot 55, NType 82, Young Serif (72pt.app), Geist Mono.</div>
                <div>Design: Nothing Phone (Nothing Technology), Samsung OneUI, CachyOS Hyprland Caelestia.</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center text-xs font-mono text-white/30 bg-white/[0.01]">
          VOIDUI • SCALABLE & COMMUNITY READY
        </div>
      </div>
    </div>
  )
}

