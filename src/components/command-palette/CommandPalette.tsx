import React, { useState, useEffect, useRef } from 'react'
import {
  Terminal,
  Search,
  ExternalLink,
  Sparkles,
  Clock,
  Palette,
  Settings,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { ThemeMode, ClockStyle } from '../../types'

interface PaletteAction {
  id: string
  title: string
  subtitle: string
  category: 'Shortcuts' | 'Appearance' | 'Widgets' | 'System'
  icon: React.ReactNode
  onSelect: () => void
}

export const CommandPalette: React.FC = () => {
  const isCommandPaletteOpen = useStore((s) => s.isCommandPaletteOpen)
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const setTheme = useStore((s) => s.setTheme)
  const setClockStyle = useStore((s) => s.setClockStyle)
  const toggleWidget = useStore((s) => s.toggleWidget)
  const shortcuts = useStore((s) => s.shortcuts)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandPaletteOpen])

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isCommandPaletteOpen])

  if (!isCommandPaletteOpen) return null

  // Build command action list
  const actions: PaletteAction[] = [
    // Theme options
    {
      id: 'theme-nothing',
      title: 'Theme: Nothing Dark (Signature Red)',
      subtitle: 'Classic Nothing OS dark monochrome with crimson accent',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-nothing-red" />,
      onSelect: () => setTheme('nothing'),
    },
    {
      id: 'theme-caelestia',
      title: 'Theme: CachyOS Caelestia Cyan',
      subtitle: 'Hyprland Linux electric cyan & obsidian glass',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-caelestia-cyan" />,
      onSelect: () => setTheme('caelestia'),
    },
    {
      id: 'theme-violet',
      title: 'Theme: Celestia Neon Violet',
      subtitle: 'CachyOS Hyprland purple neon aurora theme',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-caelestia-violet" />,
      onSelect: () => setTheme('violet'),
    },
    {
      id: 'theme-amoled',
      title: 'Theme: AMOLED Pitch Black',
      subtitle: 'True 0-nit black battery-saving high contrast',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-white" />,
      onSelect: () => setTheme('amoled'),
    },
    {
      id: 'theme-light',
      title: 'Theme: Nothing Daylight (Stark White)',
      subtitle: 'Crisp, high-contrast light mode',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-amber-500" />,
      onSelect: () => setTheme('light'),
    },

    // Clock Styles
    {
      id: 'clock-ndot',
      title: 'Clock: Nothing Dot Matrix (NDot 55)',
      subtitle: 'Authentic Nothing Phone dot matrix display',
      category: 'Appearance',
      icon: <Clock className="w-4 h-4 text-nothing-red" />,
      onSelect: () => setClockStyle('dot-matrix'),
    },
    {
      id: 'clock-young',
      title: 'Clock: Young Serif Editorial (Display)',
      subtitle: 'Rich, curvaceous vintage serif typography',
      category: 'Appearance',
      icon: <Clock className="w-4 h-4 text-yellow-400" />,
      onSelect: () => setClockStyle('young-serif'),
    },
    {
      id: 'clock-oneui',
      title: 'Clock: OneUI Dual Widget',
      subtitle: 'Samsung OneUI styled integrated widget',
      category: 'Appearance',
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      onSelect: () => setClockStyle('oneui-dual'),
    },
    {
      id: 'clock-analogue',
      title: 'Clock: Nothing Analogue Dial',
      subtitle: 'Minimal dial with signature red second hand',
      category: 'Appearance',
      icon: <Clock className="w-4 h-4 text-emerald-400" />,
      onSelect: () => setClockStyle('analogue'),
    },

    // Widget toggles
    {
      id: 'toggle-weather',
      title: 'Toggle: Weather Widget',
      subtitle: 'Show or hide live temperature and condition card',
      category: 'Widgets',
      icon: <Layers className="w-4 h-4 text-caelestia-cyan" />,
      onSelect: () => toggleWidget('weather'),
    },
    {
      id: 'toggle-media',
      title: 'Toggle: Ambient Sound Player',
      subtitle: 'Show or hide lo-fi background synthesizer',
      category: 'Widgets',
      icon: <Layers className="w-4 h-4 text-caelestia-violet" />,
      onSelect: () => toggleWidget('media'),
    },
    {
      id: 'toggle-notes',
      title: 'Toggle: Scratchpad Notes',
      subtitle: 'Show or hide quick scratchpad card',
      category: 'Widgets',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      onSelect: () => toggleWidget('notes'),
    },
    {
      id: 'toggle-todo',
      title: 'Toggle: Task List',
      subtitle: 'Show or hide daily tasks checklist',
      category: 'Widgets',
      icon: <Layers className="w-4 h-4 text-yellow-400" />,
      onSelect: () => toggleWidget('todo'),
    },

    // System
    {
      id: 'open-settings',
      title: 'Open VoidUI Settings',
      subtitle: 'Customize appearance, weather, shortcuts, backup & restore',
      category: 'System',
      icon: <Settings className="w-4 h-4 text-white/80" />,
      onSelect: () => {
        setCommandPaletteOpen(false)
        setSettingsOpen(true)
      },
    },

    // Shortcuts
    ...shortcuts.map((sc) => ({
      id: 'sc-' + sc.id,
      title: sc.title,
      subtitle: sc.url,
      category: 'Shortcuts' as const,
      icon: <ExternalLink className="w-4 h-4 text-white/60" />,
      onSelect: () => {
        window.location.href = sc.url
      },
    })),
  ]

  // Filter actions based on query
  const q = query.toLowerCase().trim()
  const filteredActions = q
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      )
    : actions

  const handleSelect = (action: PaletteAction) => {
    action.onSelect()
    setCommandPaletteOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filteredActions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex])
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 px-4 z-50 animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-void-950 border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <Terminal className="w-5 h-5 text-nothing-red shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search shortcuts..."
            className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder-white/30 font-sans"
          />
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/50">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredActions.map((action, index) => {
            const isSelected = selectedIndex === index
            return (
              <button
                key={action.id}
                onClick={() => handleSelect(action)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all ${
                  isSelected ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white/5 shrink-0">{action.icon}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-sans font-medium truncate text-white">
                      {action.title}
                    </div>
                    <div className="text-xs font-mono text-white/40 truncate mt-0.5">
                      {action.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/50 uppercase">
                    {action.category}
                  </span>
                  {isSelected && <ArrowRight className="w-3.5 h-3.5 text-nothing-red" />}
                </div>
              </button>
            )
          })}

          {filteredActions.length === 0 && (
            <div className="py-12 text-center text-xs font-mono text-white/40">
              No matching commands or shortcuts found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-white/40">
          <span>Navigate with ↑ ↓ • Select with Enter</span>
          <span className="text-nothing-red">CAELESTIA RUNNER</span>
        </div>
      </div>
    </div>
  )
}

