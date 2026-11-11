import React, { useEffect } from 'react'
import { useStore } from './store/useStore'
import { BackgroundCanvas } from './components/background/BackgroundCanvas'
import { HyprlandBar } from './components/hyprland/HyprlandBar'
import { ClockWidget } from './components/clock/ClockWidget'
import { WeatherWidget } from './components/weather/WeatherWidget'
import { MediaWidget } from './components/media/MediaWidget'
import { FocusTimerWidget } from './components/timer/FocusTimerWidget'
import { SearchBar } from './components/search/SearchBar'
import { ShortcutsWidget } from './components/shortcuts/ShortcutsWidget'
import { NotesWidget } from './components/notes/NotesWidget'
import { TodoWidget } from './components/todo/TodoWidget'
import { NewsTicker } from './components/news/NewsTicker'
import { GlyphWidget } from './components/glyph/GlyphWidget'
import { Dock } from './components/dock/Dock'
import { CommandPalette } from './components/command-palette/CommandPalette'
import { SettingsModal } from './components/settings/SettingsModal'

export const App: React.FC = () => {
  const theme = useStore((s) => s.theme)
  const widgets = useStore((s) => s.widgets)
  const minimized = useStore((s) => s.minimizedWidgets)
  const activeWorkspace = useStore((s) => s.activeWorkspace)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Minimized state checks
  const isClockMin = !!minimized['clock']
  const isWeatherMin = !!minimized['weather']
  const isMediaMin = !!minimized['media']
  const isTimerMin = !!minimized['timer']
  const isNotesMin = !!minimized['notes']
  const isTodoMin = !!minimized['todo']
  const isNewsMin = !!minimized['news']
  const isGlyphMin = !!minimized['glyph']

  // Row 1 Column Span logic (Hero widgets)
  const getClockSpan = () => {
    if (isClockMin) return 'col-span-1'
    if (isWeatherMin && isMediaMin) return 'col-span-1 md:col-span-2 lg:col-span-2'
    return 'col-span-1'
  }

  const getWeatherSpan = () => {
    if (isWeatherMin) return 'col-span-1'
    if (isClockMin && !isMediaMin) return 'col-span-1 md:col-span-2 lg:col-span-2'
    return 'col-span-1'
  }

  const getMediaSpan = () => {
    if (isMediaMin) return 'col-span-1'
    if (isClockMin && isWeatherMin) return 'col-span-1 md:col-span-2 lg:col-span-3'
    return 'col-span-1 md:col-span-2 lg:col-span-1'
  }

  // Row 3 / 4 Productivity & Dispatch Spans
  const getDynamicColSpan = (isMin: boolean, totalActive: number) => {
    if (isMin) return 'col-span-1'
    if (totalActive <= 1) return 'col-span-1 md:col-span-2 lg:col-span-2'
    return 'col-span-1'
  }

  // Count active lower cards
  const lowerWidgetsCount = [
    widgets.notes,
    widgets.todo,
    widgets.timer,
    widgets.news,
    widgets.glyph,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Dynamic Background */}
      <BackgroundCanvas />

      {/* Top Floating Hyprland Caelestia Bar */}
      {widgets.hyprlandBar && <HyprlandBar />}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6 z-10">
        {/* Workspace 5: Zen Mode (Minimal HUD) */}
        {activeWorkspace === 5 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 my-auto py-12">
            <div className="w-full max-w-md">
              <ClockWidget />
            </div>
            {widgets.search && (
              <div className="w-full max-w-xl">
                <SearchBar />
              </div>
            )}
          </div>
        ) : (
          <>
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
            {widgets.shortcuts && activeWorkspace !== 4 && (
              <div className="w-full transition-all duration-300">
                <ShortcutsWidget />
              </div>
            )}

            {/* Row 4: Self-Aware Productivity & Intelligence Grid */}
            {lowerWidgetsCount > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-14 transition-all duration-300 items-start">
                {/* Focus Timer */}
                {widgets.timer && (
                  <div
                    className={`transition-all duration-300 ${getDynamicColSpan(
                      isTimerMin,
                      lowerWidgetsCount
                    )}`}
                  >
                    <FocusTimerWidget />
                  </div>
                )}

                {/* Task List / To-Do */}
                {widgets.todo && (
                  <div
                    className={`transition-all duration-300 ${getDynamicColSpan(
                      isTodoMin,
                      lowerWidgetsCount
                    )}`}
                  >
                    <TodoWidget />
                  </div>
                )}

                {/* Scratchpad Notes */}
                {widgets.notes && (
                  <div
                    className={`transition-all duration-300 ${getDynamicColSpan(
                      isNotesMin,
                      lowerWidgetsCount
                    )}`}
                  >
                    <NotesWidget />
                  </div>
                )}

                {/* Live Tech Dispatch Feed */}
                {widgets.news && (
                  <div
                    className={`transition-all duration-300 ${getDynamicColSpan(
                      isNewsMin,
                      lowerWidgetsCount
                    )}`}
                  >
                    <NewsTicker />
                  </div>
                )}

                {/* Nothing Glyph Matrix Simulator */}
                {widgets.glyph && (
                  <div
                    className={`transition-all duration-300 ${getDynamicColSpan(
                      isGlyphMin,
                      lowerWidgetsCount
                    )}`}
                  >
                    <GlyphWidget />
                  </div>
                )}
              </div>
            )}
          </>
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
