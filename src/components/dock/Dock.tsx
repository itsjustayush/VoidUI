import React from 'react'
import {
  Compass,
  FileText,
  CheckSquare,
  Disc,
  Settings,
  Sparkles,
  Bookmark,
  Sun,
} from 'lucide-react'
import { useStore } from '../../store/useStore'

export const Dock: React.FC = () => {
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const toggleWidget = useStore((s) => s.toggleWidget)
  const widgets = useStore((s) => s.widgets)

  const dockItems = [
    {
      label: 'Launcher',
      icon: <Sparkles className="w-5 h-5 text-nothing-red" />,
      onClick: () => setCommandPaletteOpen(true),
    },
    {
      label: 'Shortcuts',
      icon: <Bookmark className="w-5 h-5 text-yellow-400" />,
      onClick: () => toggleWidget('shortcuts'),
      active: widgets.shortcuts,
    },
    {
      label: 'Scratchpad',
      icon: <FileText className="w-5 h-5 text-caelestia-cyan" />,
      onClick: () => toggleWidget('notes'),
      active: widgets.notes,
    },
    {
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
      onClick: () => toggleWidget('todo'),
      active: widgets.todo,
    },
    {
      label: 'Ambient Sound',
      icon: <Disc className="w-5 h-5 text-caelestia-violet" />,
      onClick: () => toggleWidget('media'),
      active: widgets.media,
    },
    {
      label: 'Toggle Theme',
      icon: <Sun className="w-5 h-5 text-amber-400" />,
      onClick: () => setTheme(theme === 'nothing' ? 'caelestia' : theme === 'caelestia' ? 'amoled' : 'nothing'),
    },
    {
      label: 'Settings',
      icon: <Settings className="w-5 h-5 text-white/70" />,
      onClick: () => setSettingsOpen(true),
    },
  ]

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 select-none z-30">
      <div className="flex items-center gap-1.5 p-2 rounded-full bg-void-950/85 border border-white/15 backdrop-blur-xl shadow-2xl">
        {dockItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            title={item.label}
            className={`group relative p-2.5 rounded-full transition-all duration-200 hover:-translate-y-1.5 hover:scale-110 active:scale-95 ${
              item.active === false
                ? 'opacity-40 hover:opacity-100 hover:bg-white/10'
                : 'hover:bg-white/10'
            }`}
          >
            {item.icon}

            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-void-950 border border-white/10 text-[10px] font-mono text-white/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
              {item.label}
            </span>

            {/* Active Indicator dot */}
            {item.active && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-nothing-red" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

