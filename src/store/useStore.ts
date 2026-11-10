import { create } from 'zustand'
import {
  ThemeMode,
  ClockStyle,
  SearchEngineId,
  ShortcutItem,
  TodoItem,
  WeatherData,
  WeatherConfig,
  WidgetVisibility,
  BackgroundStyle,
} from '../types'
import { DEFAULT_SHORTCUTS } from '../utils/constants'

declare const chrome: any

interface VoidUIState {
  // Theme & Style
  theme: ThemeMode
  clockStyle: ClockStyle
  clockFormat24: boolean
  showSeconds: boolean
  searchEngine: SearchEngineId
  activeWorkspace: number
  activeCategory: string
  background: BackgroundStyle
  customBgUrl: string

  // Data
  shortcuts: ShortcutItem[]
  todos: TodoItem[]
  notes: string
  weatherConfig: WeatherConfig
  weatherData: WeatherData | null

  // Widgets
  widgets: WidgetVisibility

  // UI Modals
  isSettingsOpen: boolean
  isCommandPaletteOpen: boolean

  // Actions
  setTheme: (theme: ThemeMode) => void
  setClockStyle: (style: ClockStyle) => void
  setClockFormat24: (val: boolean) => void
  setShowSeconds: (val: boolean) => void
  setSearchEngine: (engine: SearchEngineId) => void
  setActiveWorkspace: (ws: number) => void
  setActiveCategory: (cat: string) => void
  setBackground: (bg: BackgroundStyle) => void
  setCustomBgUrl: (url: string) => void

  addShortcut: (shortcut: Omit<ShortcutItem, 'id'>) => void
  updateShortcut: (id: string, shortcut: Partial<ShortcutItem>) => void
  removeShortcut: (id: string) => void
  resetShortcuts: () => void

  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  pinTodo: (id: string) => void

  setNotes: (text: string) => void
  setWeatherConfig: (cfg: Partial<WeatherConfig>) => void
  setWeatherData: (data: WeatherData | null) => void
  toggleWidget: (widgetKey: keyof WidgetVisibility) => void

  setSettingsOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void

  exportConfig: () => string
  importConfig: (jsonStr: string) => boolean
  resetToDefaults: () => void
}

const STORAGE_KEY = 'void_ui_state_v1'

const DEFAULT_WIDGETS: WidgetVisibility = {
  hyprlandBar: true,
  clock: true,
  weather: true,
  search: true,
  shortcuts: true,
  notes: true,
  todo: true,
  media: true,
  dock: true,
  systemCard: true,
}

const DEFAULT_WEATHER_CONFIG: WeatherConfig = {
  city: 'London',
  unit: 'C',
  apiKey: '',
  useAutoLocation: true,
}

const DEFAULT_TODOS: TodoItem[] = [
  { id: '1', text: 'Explore VoidUI widgets & settings', completed: false, pinned: true, createdAt: Date.now() - 3600000 },
  { id: '2', text: 'Try switching to Young Serif or Analogue clock', completed: false, createdAt: Date.now() - 1800000 },
  { id: '3', text: 'Press Ctrl+K to launch Caelestia command runner', completed: false, createdAt: Date.now() },
]

function getInitialState(): Partial<VoidUIState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err)
  }
  return {}
}

const initialState = getInitialState()

export const useStore = create<VoidUIState>((set, get) => ({
  theme: initialState.theme || 'nothing',
  clockStyle: initialState.clockStyle || 'dot-matrix',
  clockFormat24: initialState.clockFormat24 !== undefined ? initialState.clockFormat24 : true,
  showSeconds: initialState.showSeconds !== undefined ? initialState.showSeconds : false,
  searchEngine: initialState.searchEngine || 'google',
  activeWorkspace: initialState.activeWorkspace || 1,
  activeCategory: 'All',
  background: initialState.background || 'dot-matrix',
  customBgUrl: initialState.customBgUrl || '',

  shortcuts: initialState.shortcuts || DEFAULT_SHORTCUTS,
  todos: initialState.todos || DEFAULT_TODOS,
  notes: initialState.notes || '## VoidUI Scratchpad\n- Press `Ctrl + K` anytime to open launcher\n- Change clock style in settings (NDot 55 / Young Serif / OneUI / Analogue)\n- Ambient audio player in media widget\n- Enjoy lightning fast new tab experience',
  weatherConfig: { ...DEFAULT_WEATHER_CONFIG, ...initialState.weatherConfig },
  weatherData: initialState.weatherData || null,

  widgets: { ...DEFAULT_WIDGETS, ...initialState.widgets },

  isSettingsOpen: false,
  isCommandPaletteOpen: false,

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
    saveState(get())
  },

  setClockStyle: (clockStyle) => {
    set({ clockStyle })
    saveState(get())
  },

  setClockFormat24: (clockFormat24) => {
    set({ clockFormat24 })
    saveState(get())
  },

  setShowSeconds: (showSeconds) => {
    set({ showSeconds })
    saveState(get())
  },

  setSearchEngine: (searchEngine) => {
    set({ searchEngine })
    saveState(get())
  },

  setActiveWorkspace: (activeWorkspace) => {
    set({ activeWorkspace })
    saveState(get())
  },

  setActiveCategory: (activeCategory) => {
    set({ activeCategory })
  },

  setBackground: (background) => {
    set({ background })
    saveState(get())
  },

  setCustomBgUrl: (customBgUrl) => {
    set({ customBgUrl })
    saveState(get())
  },

  addShortcut: (shortcut) => {
    const newItem: ShortcutItem = {
      ...shortcut,
      id: 'sc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    }
    set((state) => ({ shortcuts: [...state.shortcuts, newItem] }))
    saveState(get())
  },

  updateShortcut: (id, updated) => {
    set((state) => ({
      shortcuts: state.shortcuts.map((sc) => (sc.id === id ? { ...sc, ...updated } : sc)),
    }))
    saveState(get())
  },

  removeShortcut: (id) => {
    set((state) => ({
      shortcuts: state.shortcuts.filter((sc) => sc.id !== id),
    }))
    saveState(get())
  },

  resetShortcuts: () => {
    set({ shortcuts: DEFAULT_SHORTCUTS })
    saveState(get())
  },

  addTodo: (text) => {
    if (!text.trim()) return
    const newTodo: TodoItem = {
      id: 'td_' + Date.now().toString(36),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    }
    set((state) => ({ todos: [newTodo, ...state.todos] }))
    saveState(get())
  },

  toggleTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((td) => (td.id === id ? { ...td, completed: !td.completed } : td)),
    }))
    saveState(get())
  },

  deleteTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((td) => td.id !== id),
    }))
    saveState(get())
  },

  pinTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((td) => (td.id === id ? { ...td, pinned: !td.pinned } : td)),
    }))
    saveState(get())
  },

  setNotes: (notes) => {
    set({ notes })
    saveState(get())
  },

  setWeatherConfig: (cfg) => {
    set((state) => ({ weatherConfig: { ...state.weatherConfig, ...cfg } }))
    saveState(get())
  },

  setWeatherData: (weatherData) => {
    set({ weatherData })
  },

  toggleWidget: (widgetKey) => {
    set((state) => ({
      widgets: {
        ...state.widgets,
        [widgetKey]: !state.widgets[widgetKey],
      },
    }))
    saveState(get())
  },

  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

  exportConfig: () => {
    const state = get()
    const exportable = {
      theme: state.theme,
      clockStyle: state.clockStyle,
      clockFormat24: state.clockFormat24,
      showSeconds: state.showSeconds,
      searchEngine: state.searchEngine,
      background: state.background,
      customBgUrl: state.customBgUrl,
      shortcuts: state.shortcuts,
      todos: state.todos,
      notes: state.notes,
      weatherConfig: state.weatherConfig,
      widgets: state.widgets,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(exportable, null, 2)
  },

  importConfig: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr)
      set({
        theme: data.theme || 'nothing',
        clockStyle: data.clockStyle || 'dot-matrix',
        clockFormat24: data.clockFormat24 ?? true,
        showSeconds: data.showSeconds ?? false,
        searchEngine: data.searchEngine || 'google',
        background: data.background || 'dot-matrix',
        customBgUrl: data.customBgUrl || '',
        shortcuts: data.shortcuts || DEFAULT_SHORTCUTS,
        todos: data.todos || DEFAULT_TODOS,
        notes: data.notes || '',
        weatherConfig: { ...DEFAULT_WEATHER_CONFIG, ...data.weatherConfig },
        widgets: { ...DEFAULT_WIDGETS, ...data.widgets },
      })
      document.documentElement.setAttribute('data-theme', data.theme || 'nothing')
      saveState(get())
      return true
    } catch (err) {
      console.error('Failed to parse import JSON:', err)
      return false
    }
  },

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({
      theme: 'nothing',
      clockStyle: 'dot-matrix',
      clockFormat24: true,
      showSeconds: false,
      searchEngine: 'google',
      activeWorkspace: 1,
      activeCategory: 'All',
      background: 'dot-matrix',
      customBgUrl: '',
      shortcuts: DEFAULT_SHORTCUTS,
      todos: DEFAULT_TODOS,
      notes: '## VoidUI Scratchpad\n- Press `Ctrl + K` anytime to open launcher',
      weatherConfig: DEFAULT_WEATHER_CONFIG,
      widgets: DEFAULT_WIDGETS,
    })
    document.documentElement.setAttribute('data-theme', 'nothing')
  },
}))

function saveState(state: VoidUIState) {
  try {
    const toSave = {
      theme: state.theme,
      clockStyle: state.clockStyle,
      clockFormat24: state.clockFormat24,
      showSeconds: state.showSeconds,
      searchEngine: state.searchEngine,
      activeWorkspace: state.activeWorkspace,
      background: state.background,
      customBgUrl: state.customBgUrl,
      shortcuts: state.shortcuts,
      todos: state.todos,
      notes: state.notes,
      weatherConfig: state.weatherConfig,
      widgets: state.widgets,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    // Also sync to chrome.storage.local if available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: toSave })
    }
  } catch (err) {
    console.error('Error saving state:', err)
  }
}
