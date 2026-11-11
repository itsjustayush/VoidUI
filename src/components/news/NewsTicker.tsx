import React, { useState, useEffect, useRef } from 'react'
import {
  Newspaper,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { NewsItem } from '../../types'

const CACHE_KEY = 'void_news_cache_v1'
const CACHE_TTL = 15 * 60 * 1000 // 15 mins

export const NewsTicker: React.FC = () => {
  const minimized = useStore((s) => !!s.minimizedWidgets['news'])
  const toggleMinimized = useStore((s) => s.toggleWidgetMinimized)

  const [news, setNews] = useState<NewsItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const fetchNews = async () => {
    setLoading(true)
    try {
      // Check cache
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Date.now() - parsed.timestamp < CACHE_TTL && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setNews(parsed.items)
          setLoading(false)
          return
        }
      }

      // Fetch top story IDs from Hacker News API
      const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      if (!topIdsRes.ok) throw new Error('HN topstories failed')
      const topIds: number[] = await topIdsRes.json()

      const top10 = topIds.slice(0, 10)
      const items: NewsItem[] = await Promise.all(
        top10.map(async (id) => {
          try {
            const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            const data = await itemRes.json()
            let domain = 'news.ycombinator.com'
            if (data.url) {
              try {
                domain = new URL(data.url).hostname.replace('www.', '')
              } catch {}
            }
            const timeAgoHours = Math.max(1, Math.round((Date.now() / 1000 - data.time) / 3600))

            return {
              id: String(data.id),
              title: data.title || 'Untitled',
              url: data.url || `https://news.ycombinator.com/item?id=${data.id}`,
              source: domain,
              timeAgo: `${timeAgoHours}h ago`,
              points: data.score || 0,
            }
          } catch {
            return {
              id: String(id),
              title: 'Hacker News Item',
              url: `https://news.ycombinator.com/item?id=${id}`,
              source: 'ycombinator.com',
              timeAgo: 'recently',
              points: 0,
            }
          }
        })
      )

      setNews(items)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), items }))
    } catch (e) {
      console.warn('Failed to fetch HN news:', e)
      // Fallback tech news
      setNews([
        {
          id: '1',
          title: 'Linux 6.12 Released With Real-Time "PREEMPT_RT" Support',
          url: 'https://kernel.org',
          source: 'kernel.org',
          timeAgo: '1h ago',
          points: 412,
        },
        {
          id: '2',
          title: 'Nothing OS 3.0 Open Beta Releases With Dot-Matrix Lockscreen',
          url: 'https://nothing.tech',
          source: 'nothing.tech',
          timeAgo: '3h ago',
          points: 298,
        },
        {
          id: '3',
          title: 'Hyprland Wayland Compositor Reaches Version 0.45',
          url: 'https://hyprland.org',
          source: 'hyprland.org',
          timeAgo: '5h ago',
          points: 185,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  // Auto advance ticker
  useEffect(() => {
    if (isPaused || news.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isPaused, news.length])

  const currentItem = news[currentIndex] || null

  const handleNext = () => {
    if (news.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % news.length)
  }

  const handlePrev = () => {
    if (news.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length)
  }

  // Minimized Pill Mode (Dynamic Tiling)
  if (minimized) {
    return (
      <div className="void-card p-3 select-none flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3 overflow-hidden mr-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Newspaper className="w-4 h-4 text-nothing-red" />
          </div>
          <div className="truncate">
            <div className="text-xs font-sans text-white/90 truncate font-medium">
              {currentItem?.title || 'Loading tech headlines...'}
            </div>
            <div className="text-[10px] font-mono text-white/40 flex items-center gap-2">
              <span>{currentItem?.source}</span>
              <span>•</span>
              <span>{currentItem?.points} pts</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {currentItem?.url && (
            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all"
              title="Open article"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => toggleMinimized('news')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Expand card"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // Expanded Full Card
  return (
    <div
      className="void-card p-5 select-none relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-nothing-red" />
          <span className="font-ndot uppercase tracking-wider text-white/90">
            DISPATCH // TECH FEED
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/50">
            {currentIndex + 1}/{news.length || 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title={isPaused ? 'Resume auto-ticker' : 'Pause auto-ticker'}
          >
            {isPaused ? <Play className="w-3 h-3 text-nothing-red" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            onClick={fetchNews}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Refresh news"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-nothing-red' : ''}`} />
          </button>
          <button
            onClick={() => toggleMinimized('news')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Minimize card"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Headline Display */}
      <div className="my-3 min-h-[68px] flex flex-col justify-center">
        {loading && news.length === 0 ? (
          <div className="text-xs font-mono text-white/40 animate-pulse flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin text-nothing-red" />
            <span>FETCHING RECENT WIRE DISPATCHES...</span>
          </div>
        ) : (
          <div>
            <a
              href={currentItem?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-start justify-between gap-2 text-white/90 hover:text-white transition-colors"
            >
              <h3 className="font-sans font-semibold text-sm sm:text-base leading-snug line-clamp-2">
                {currentItem?.title}
              </h3>
              <ExternalLink className="w-4 h-4 shrink-0 text-white/30 group-hover/link:text-nothing-red group-hover/link:translate-x-0.5 transition-all mt-0.5" />
            </a>

            <div className="flex items-center gap-2 text-[11px] font-mono text-white/40 mt-2">
              <span className="text-nothing-red font-semibold">{currentItem?.points} pts</span>
              <span>•</span>
              <span className="truncate max-w-[140px] text-white/60">{currentItem?.source}</span>
              <span>•</span>
              <span>{currentItem?.timeAgo}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          {news.slice(0, 7).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-5 bg-nothing-red' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`Story ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Previous Story"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Next Story"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

