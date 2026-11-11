import React, { useEffect } from 'react'
import { useStore } from './store/useStore'
import { BackgroundCanvas } from './components/background/BackgroundCanvas'
import { HyprlandBar } from './components/hyprland/HyprlandBar'
import { ClockWidget } from './components/clock/ClockWidget'
import { WeatherWidget } from './components/weather/WeatherWidget'
import { MediaWidget } from './components/media/MediaWidget'
import { SearchBar } from './components/search/SearchBar'
import { ShortcutsWidget } from './components/shortcuts/ShortcutsWidget'
import { NotesWidget } from './components/notes/NotesWidget'
import { TodoWidget } from './components/todo/TodoWidget'
import { Dock } from './components/dock/Dock'
import { CommandPalette } from './components/command-palette/CommandPalette'
import { SettingsModal } from './components/settings/SettingsModal'

export const App: React.FC = () => {
  const theme = useStore((s) => s.theme)
  const widgets = useStore((s) => s.widgets)
  const minimized = useStore((s) => s.minimizedWidgets)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Dynamic self-aware layout calculations
  const isClockMin = !!minimized['clock']
  const isWeatherMin = !!minimized['weather']
  const isMediaMin = !!minimized['media']
  const isNotesMin = !!minimized['notes']
  const isTodoMin = !!minimized['todo']

  // Row 1 Column Span logic
  const getClockSpan = () => {
    if (isClockMin) return 'col-span-1'
    if (isWeatherMin && isMediaMin) return 'col-span-1 md:col-span-2 lg:col-span-2'
    if (isWeatherMin && !isMediaMin) return 'col-span-1 md:col-span-2 lg:col-span-2'
    return 'col-span-1'
  }

  const getWeatherSpan = () => {
    if (isWeatherMin) return 'col-span-1'
    if (isClockMin && !isMediaMin) return 'col-span-1 md:col-span-2 lg:col-span-2'
    if (isClockMin && isMediaMin) return 'col-span-1 md:col-span-2 lg:col-span-2'
    return 'col-span-1'
  }

  const getMediaSpan = () => {
    if (isMediaMin) return 'col-span-1'
    if (isClockMin && isWeatherMin) return 'col-span-1 md:col-span-2 lg:col-span-3'
    return 'col-span-1 md:col-span-2 lg:col-span-1'
  }

  // Row 4 Productivity Span logic
  const getNotesSpan = () => {
    if (isNotesMin && !isTodoMin) return 'col-span-1'
    if (!isNotesMin && isTodoMin) return 'col-span-1 md:col-span-2'
    return 'col-span-1'
  }

  const getTodoSpan = () => {
    if (isTodoMin && !isNotesMin) return 'col-span-1'
    if (!isTodoMin && isNotesMin) return 'col-span-1 md:col-span-2'
    return 'col-span-1'
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Dynamic Background */}
      <BackgroundCanvas />

      {/* Top Floating Hyprland Caelestia Bar */}
      {widgets.hyprlandBar && <HyprlandBar />}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6 z-10">
        {/* Row 1: Self-Aware Dynamic Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start transition-all duration-300">
          {widgets.clock && (
            <div className={`transition-all duration-300 ${getClockSpan()}`}>
              <ClockWidget />
            </div>
          )}

          {widgets.weather && (
            <div className={`transition-all duration-300 ${getWeatherSpan()}`}>
              <WeatherWidget />
            </div>
          )}

          {widgets.media && (
            <div className={`transition-all duration-300 ${getMediaSpan()}`}>
              <MediaWidget />
            </div>
          )}
        </div>

        {/* Row 2: Omnibar Search */}
        {widgets.search && (
          <div className="w-full max-w-4xl mx-auto">
            <SearchBar />
          </div>
        )}

        {/* Row 3: Shortcuts Grid (with Collapse support) */}
        {widgets.shortcuts && (
          <div className="w-full transition-all duration-300">
            <ShortcutsWidget />
          </div>
        )}

        {/* Row 4: Self-Aware Productivity Grid (Scratchpad Notes & Tasks) */}
        {(widgets.notes || widgets.todo) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14 transition-all duration-300">
            {widgets.notes && (
              <div className={`transition-all duration-300 ${getNotesSpan()}`}>
                <NotesWidget />
              </div>
            )}
            {widgets.todo && (
              <div className={`transition-all duration-300 ${getTodoSpan()}`}>
                <TodoWidget />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Floating Quick Dock */}
      {widgets.dock && <Dock />}

      {/* Caelestia Command Runner Modal (Ctrl+K) */}
      <CommandPalette />

      {/* Nothing OS Settings Drawer */}
      <SettingsModal />
    </div>
  )
}

export default App
