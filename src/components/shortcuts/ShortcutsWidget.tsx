import React, { useState, useEffect } from 'react'
import { Plus, ExternalLink, Trash2, Edit2, X, Folder, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { ShortcutItem } from '../../types'

declare const chrome: any

export const ShortcutsWidget: React.FC = () => {
  const shortcuts = useStore((s) => s.shortcuts)
  const activeCategory = useStore((s) => s.activeCategory)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const addShortcut = useStore((s) => s.addShortcut)
  const removeShortcut = useStore((s) => s.removeShortcut)
  const updateShortcut = useStore((s) => s.updateShortcut)
  const minimized = useStore((s) => !!s.minimizedWidgets['shortcuts'])
  const toggleMinimized = useStore((s) => s.toggleWidgetMinimized)

  const [topSites, setTopSites] = useState<ShortcutItem[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShortcutItem | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Daily')
  const [color, setColor] = useState('#d71921')

  // Load native browser Top Sites in Helium / Chrome
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.topSites && chrome.topSites.get) {
      chrome.topSites.get((sites: Array<{ title: string; url: string }>) => {
        if (sites && sites.length > 0) {
          const mapped = sites.slice(0, 10).map((s, idx) => ({
            id: 'topsite_' + idx,
            title: s.title || new URL(s.url).hostname.replace(/^www\./, ''),
            url: s.url,
            category: 'Frequent',
            color: '#00f2fe',
          }))
          setTopSites(mapped)
        }
      })
    }
  }, [])

  // Combine topSites with custom shortcuts for category display
  const allAvailableShortcuts = topSites.length > 0 ? [...shortcuts, ...topSites] : shortcuts

  // Extract unique categories
  const baseCategories = Array.from(new Set(shortcuts.map((s) => s.category)))
  const categories = topSites.length > 0
    ? ['All', 'Frequent', ...baseCategories]
    : ['All', ...baseCategories]

  const filteredShortcuts =
    activeCategory === 'All'
      ? shortcuts
      : activeCategory === 'Frequent'
      ? topSites
      : shortcuts.filter((s) => s.category === activeCategory)

  const handleOpenAdd = () => {
    setTitle('')
    setUrl('')
    setCategory('Daily')
    setColor('#d71921')
    setEditingItem(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (item: ShortcutItem, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingItem(item)
    setTitle(item.title)
    setUrl(item.url)
    setCategory(item.category)
    setColor(item.color || '#d71921')
    setIsAddModalOpen(true)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Delete this shortcut?')) {
      removeShortcut(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    if (editingItem) {
      updateShortcut(editingItem.id, {
        title: title.trim(),
        url: finalUrl,
        category: category.trim(),
        color,
      })
    } else {
      addShortcut({
        title: title.trim(),
        url: finalUrl,
        category: category.trim(),
        color,
      })
    }
    setIsAddModalOpen(false)
  }

  const getFaviconUrl = (linkUrl: string) => {
    try {
      const u = new URL(linkUrl)
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`
    } catch {
      return ''
    }
  }

  // Minimized state: sleek compact quick icon dock
  if (minimized) {
    return (
      <div className="void-card p-3 select-none flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <span className="font-ndot text-xs uppercase tracking-wider text-white/50 pl-1 shrink-0">
            SHORTCUTS
          </span>
          <div className="flex items-center gap-2">
            {shortcuts.slice(0, 10).map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center p-1.5 transition-transform hover:scale-110 shrink-0"
                title={`${item.title} (${item.url})`}
              >
                <img
                  src={getFaviconUrl(item.url)}
                  alt={item.title}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  className="w-full h-full object-contain"
                />
              </a>
            ))}
          </div>
        </div>

        <button
          onClick={() => toggleMinimized('shortcuts')}
          className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all ml-2 shrink-0"
          title="Expand shortcuts"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="void-card p-5 sm:p-6 select-none flex flex-col gap-4 transition-all duration-300">
      {/* Top Header: Title, Category Pills & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-nothing-red" />
          <span className="font-ndot text-sm tracking-wider uppercase text-white/90">SHORTCUTS</span>
          <span className="text-xs font-mono text-white/40">({filteredShortcuts.length})</span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                activeCategory === cat
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-nothing-red text-white text-xs font-mono transition-all"
            title="Add new shortcut"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={() => toggleMinimized('shortcuts')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Minimize shortcuts"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {filteredShortcuts.map((item) => {
          const favUrl = getFaviconUrl(item.url)
          const isTopSite = item.id.startsWith('topsite_')
          return (
            <a
              key={item.id}
              href={item.url}
              className="group relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              title={`${item.title} (${item.url})`}
            >
              {!isTopSite && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
                  <button
                    onClick={(e) => handleOpenEdit(item, e)}
                    className="p-1 rounded bg-black/60 hover:bg-white/20 text-white/70 hover:text-white"
                    title="Edit"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1 rounded bg-black/60 hover:bg-nothing-red text-white/70 hover:text-white"
                    title="Delete"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {/* Icon Squircle */}
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center p-2.5 relative overflow-hidden transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${item.color ? `${item.color}33` : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {item.color && (
                  <div
                    className="absolute -top-3 -right-3 w-6 h-6 rounded-full blur-md opacity-50"
                    style={{ backgroundColor: item.color }}
                  />
                )}

                <img
                  src={favUrl}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />

                <span className="font-ntypeHead font-bold text-lg text-white/90 hidden [img:hidden+&]:inline">
                  {item.title.charAt(0).toUpperCase()}
                </span>
              </div>

              <span className="text-xs font-sans text-white/80 group-hover:text-white truncate max-w-[80px] text-center">
                {item.title}
              </span>
            </a>
          )
        })}

        {filteredShortcuts.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs font-mono text-white/40">
            No shortcuts in this category. Click "+ New" to add one.
          </div>
        )}
      </div>

      {/* Add / Edit Shortcut Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-void-950 border border-white/20 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-ndot text-lg uppercase tracking-wider text-white mb-4">
              {editingItem ? 'Edit Shortcut' : 'Add Shortcut'}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. GitHub"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-nothing-red"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1 uppercase">URL</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-nothing-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1 uppercase">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Daily, Dev, AI, etc."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-nothing-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1 uppercase">Color Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-white/50">{color}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-white/60 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-nothing-red hover:bg-nothing-red-bright text-white text-xs font-mono font-semibold transition-all shadow-glow-red"
                >
                  {editingItem ? 'Save Changes' : 'Add Shortcut'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
