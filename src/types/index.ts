export type ThemeMode = 'nothing' | 'caelestia' | 'violet' | 'amoled' | 'light'

export type ClockStyle = 'dot-matrix' | 'young-serif' | 'oneui-dual' | 'analogue'

export type SearchEngineId =
  | 'google'
  | 'duckduckgo'
  | 'bing'
  | 'brave'
  | 'perplexity'
  | 'kagi'
  | 'youtube'
  | 'github'
  | 'wikipedia'

export interface SearchEngine {
  id: SearchEngineId
  name: string
  url: string
  suggestUrl?: string
  iconName: string
}

export interface ShortcutItem {
  id: string
  title: string
  url: string
  icon?: string
  category: string
  color?: string
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  pinned?: boolean
  createdAt: number
}

export interface WeatherData {
  temp: number
  tempMin: number
  tempMax: number
  condition: string
  city: string
  country: string
  humidity: number
  windSpeed: number
  iconKey: string
  isDay: boolean
  updatedAt: number
}

export interface WeatherConfig {
  city: string
  unit: 'C' | 'F'
  apiKey: string
  useAutoLocation: boolean
}

export interface WidgetVisibility {
  hyprlandBar: boolean
  clock: boolean
  weather: boolean
  search: boolean
  shortcuts: boolean
  notes: boolean
  todo: boolean
  media: boolean
  dock: boolean
  systemCard: boolean
}

export type BackgroundStyle =
  | 'dot-matrix'
  | 'caelestia-mesh'
  | 'starry'
  | 'minimal'
  | 'oled'
  | 'custom'

export interface AmbientTrack {
  id: string
  title: string
  type: 'rain' | 'space' | 'lofi' | 'city' | 'stream'
  url?: string
}

