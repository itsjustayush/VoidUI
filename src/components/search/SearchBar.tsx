import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Globe,
  Shield,
  Flame,
  Sparkles,
  Play,
  Code,
  Compass,
  BookOpen,
  X,
  Mic,
  ChevronDown,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { SEARCH_ENGINES } from '../../utils/constants'
import { SearchEngineId } from '../../types'

const ENGINE_ICONS: Record<string, React.ReactNode> = {
  Search: <Search className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4 text-emerald-400" />,
  Flame: <Flame className="w-4 h-4 text-orange-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-cyan-400" />,
  Globe: <Globe className="w-4 h-4 text-blue-400" />,
  Code: <Code className="w-4 h-4 text-purple-400" />,
  Play: <Play className="w-4 h-4 text-red-500" />,
  Compass: <Compass className="w-4 h-4 text-yellow-400" />,
  BookOpen: <BookOpen className="w-4 h-4 text-gray-300" />,
}

export const SearchBar: React.FC = () => {
  const searchEngine = useStore((s) => s.searchEngine)
  const setSearchEngine = useStore((s) => s.setSearchEngine)

  const [query, setQuery] = useState('')
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [isListening, setIsListening] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentEngine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google

  // Close engine dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsEngineMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto focus input when user types '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch search suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        // Try Google / DuckDuckGo suggestion API
        const suggestUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`
        const res = await fetch(suggestUrl)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data[1]) {
            setSuggestions(data[1].slice(0, 5))
          }
        }
      } catch {
        // Silently fallback if CORS blocked
        setSuggestions([])
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (searchQuery = query) => {
    const q = searchQuery.trim()
    if (!q) return

    // If it looks like a direct URL, navigate directly
    if (/^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/.test(q)) {
      const url = q.startsWith('http') ? q : `https://${q}`
      window.location.href = url
      return
    }

    const targetUrl = `${currentEngine.url}${encodeURIComponent(q)}`
    window.location.href = targetUrl
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        handleSearch(suggestions[activeSuggestion])
      } else {
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion((prev) => (prev > -1 ? prev - 1 : -1))
    } else if (e.key === 'Escape') {
      setSuggestions([])
      inputRef.current?.blur()
    }
  }

  // Voice Search (Speech Recognition)
  const toggleVoiceSearch = () => {
    // @ts-expect-error Webkit Speech
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) return

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        handleSearch(transcript)
      }

      recognition.start()
    } catch (err) {
      console.error(err)
      setIsListening(false)
    }
  }

  return (
    <div className="w-full relative select-none">
      {/* Omnibar Container */}
      <div className="void-card flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 relative group transition-all duration-300 focus-within:border-white/30 focus-within:shadow-[0_0_25px_rgba(255,255,255,0.08)]">
        {/* Search Engine Switcher */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-mono"
            title={`Current engine: ${currentEngine.name} (Click to switch)`}
          >
            {ENGINE_ICONS[currentEngine.iconName] || <Search className="w-4 h-4" />}
            <span className="hidden sm:inline font-sans text-xs">{currentEngine.name}</span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>

          {/* Engine Dropdown Menu */}
          {isEngineMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl bg-void-950/95 border border-white/15 backdrop-blur-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-ndot uppercase tracking-wider text-white/40 px-2.5 py-1">
                SELECT ENGINE
              </div>
              <div className="flex flex-col gap-0.5">
                {Object.values(SEARCH_ENGINES).map((engine) => (
                  <button
                    key={engine.id}
                    onClick={() => {
                      setSearchEngine(engine.id as SearchEngineId)
                      setIsEngineMenuOpen(false)
                      inputRef.current?.focus()
                    }}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans transition-all text-left ${
                      searchEngine === engine.id
                        ? 'bg-nothing-red/20 text-white font-medium border border-nothing-red/30'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {ENGINE_ICONS[engine.iconName]}
                    <span>{engine.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search with ${currentEngine.name} or enter URL...`}
          className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder-white/35 font-sans"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={toggleVoiceSearch}
          className={`p-1.5 rounded-xl transition-all ${
            isListening
              ? 'bg-nothing-red text-white animate-pulse'
              : 'text-white/40 hover:text-white hover:bg-white/10'
          }`}
          title="Voice search"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Search Action Button */}
        <button
          type="button"
          onClick={() => handleSearch()}
          className="p-2 rounded-xl bg-white/10 hover:bg-nothing-red text-white transition-all shadow-sm group-hover:scale-105"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Query Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-void-950/95 border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden z-40">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSearch(suggestion)}
              onMouseEnter={() => setActiveSuggestion(index)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                activeSuggestion === index ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

