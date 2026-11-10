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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Dynamic Background (Dot Matrix / Aurora Mesh / Starry / OLED) */}
      <BackgroundCanvas />

      {/* Top Floating Hyprland Caelestia Bar */}
      {widgets.hyprlandBar && <HyprlandBar />}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6 z-10">
        {/* Row 1: Clocks, Weather, Ambient Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {widgets.clock && (
            <div className="h-full">
              <ClockWidget />
            </div>
          )}

          {widgets.weather && (
            <div className="h-full">
              <WeatherWidget />
            </div>
          )}

          {widgets.media && (
            <div className="h-full md:col-span-2 lg:col-span-1">
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

        {/* Row 3: Shortcuts Grid */}
        {widgets.shortcuts && (
          <div className="w-full">
            <ShortcutsWidget />
          </div>
        )}

        {/* Row 4: Productivity Side-by-Side (Scratchpad Notes & Tasks) */}
        {(widgets.notes || widgets.todo) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
            {widgets.notes && <NotesWidget />}
            {widgets.todo && <TodoWidget />}
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

