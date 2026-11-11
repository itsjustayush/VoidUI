import React from 'react'
import { FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../../store/useStore'

export const NotesWidget: React.FC = () => {
  const notes = useStore((s) => s.notes)
  const setNotes = useStore((s) => s.setNotes)
  const minimized = useStore((s) => !!s.minimizedWidgets['notes'])
  const toggleMinimized = useStore((s) => s.toggleWidgetMinimized)

  const charCount = notes.length
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0

  if (minimized) {
    return (
      <div className="void-card p-3 select-none flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-caelestia-cyan" />
          <span className="font-ndot text-sm text-white font-medium uppercase tracking-wider">Scratchpad</span>
          <span className="text-[10px] font-mono text-white/40">({wordCount} words)</span>
        </div>
        <button
          onClick={() => toggleMinimized('notes')}
          className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
          title="Expand scratchpad"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="void-card p-5 select-none flex flex-col justify-between h-full min-h-[220px] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-2.5 mb-2">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-caelestia-cyan" />
          <span className="font-ndot uppercase tracking-wider text-white/90">SCRATCHPAD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 font-mono">
            {wordCount}w • {charCount}c
          </span>
          <button
            onClick={() => {
              if (confirm('Clear scratchpad?')) setNotes('')
            }}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear notes"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => toggleMinimized('notes')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Minimize scratchpad"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type quick thoughts, code snippets, or ideas here (auto-saved)..."
        className="flex-1 w-full bg-transparent border-none outline-none resize-none font-mono text-xs sm:text-sm text-white/85 placeholder-white/30 leading-relaxed py-1"
        spellCheck={false}
      />

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
        <span>AUTO-SAVED TO STORAGE</span>
        <span className="text-caelestia-cyan">VOID / NOTES</span>
      </div>
    </div>
  )
}
