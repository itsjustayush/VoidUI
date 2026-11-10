import { SearchEngine, ShortcutItem } from '../types'

export const SEARCH_ENGINES: Record<string, SearchEngine> = {
  google: {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    suggestUrl: 'https://suggestqueries.google.com/complete/search?client=chrome&q=',
    iconName: 'Search',
  },
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    suggestUrl: 'https://duckduckgo.com/ac/?q=',
    iconName: 'Shield',
  },
  brave: {
    id: 'brave',
    name: 'Brave',
    url: 'https://search.brave.com/search?q=',
    iconName: 'Flame',
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity AI',
    url: 'https://www.perplexity.ai/search?q=',
    iconName: 'Sparkles',
  },
  bing: {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    iconName: 'Globe',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    iconName: 'Code',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=',
    iconName: 'Play',
  },
  kagi: {
    id: 'kagi',
    name: 'Kagi',
    url: 'https://kagi.com/search?q=',
    iconName: 'Compass',
  },
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Special:Search?search=',
    iconName: 'BookOpen',
  },
}

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  // AI Tools
  {
    id: 'chatgpt',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    category: 'AI',
    color: '#10a37f',
  },
  {
    id: 'claude',
    title: 'Claude',
    url: 'https://claude.ai',
    category: 'AI',
    color: '#d97706',
  },
  {
    id: 'perplexity',
    title: 'Perplexity',
    url: 'https://www.perplexity.ai',
    category: 'AI',
    color: '#06b6d4',
  },
  {
    id: 'gemini',
    title: 'Gemini',
    url: 'https://gemini.google.com',
    category: 'AI',
    color: '#3b82f6',
  },

  // Dev
  {
    id: 'github',
    title: 'GitHub',
    url: 'https://github.com',
    category: 'Dev',
    color: '#ffffff',
  },
  {
    id: 'vercel',
    title: 'Vercel',
    url: 'https://vercel.com',
    category: 'Dev',
    color: '#000000',
  },
  {
    id: 'figma',
    title: 'Figma',
    url: 'https://figma.com',
    category: 'Dev',
    color: '#a259ff',
  },
  {
    id: 'stackoverflow',
    title: 'StackOverflow',
    url: 'https://stackoverflow.com',
    category: 'Dev',
    color: '#f48225',
  },

  // Daily
  {
    id: 'youtube',
    title: 'YouTube',
    url: 'https://youtube.com',
    category: 'Daily',
    color: '#ff0000',
  },
  {
    id: 'reddit',
    title: 'Reddit',
    url: 'https://reddit.com',
    category: 'Daily',
    color: '#ff4500',
  },
  {
    id: 'x',
    title: 'X / Twitter',
    url: 'https://x.com',
    category: 'Daily',
    color: '#e5e5e5',
  },
  {
    id: 'gmail',
    title: 'Gmail',
    url: 'https://mail.google.com',
    category: 'Daily',
    color: '#ea4335',
  },

  // Media
  {
    id: 'spotify',
    title: 'Spotify',
    url: 'https://open.spotify.com',
    category: 'Media',
    color: '#1db954',
  },
  {
    id: 'twitch',
    title: 'Twitch',
    url: 'https://twitch.tv',
    category: 'Media',
    color: '#9146ff',
  },
  {
    id: 'netflix',
    title: 'Netflix',
    url: 'https://netflix.com',
    category: 'Media',
    color: '#e50914',
  },
]

export const WORKSPACE_PRESETS = [
  { id: 1, name: 'Home', tag: 'Main HUD' },
  { id: 2, name: 'Code', tag: 'Dev & Git' },
  { id: 3, name: 'AI & Media', tag: 'Neural' },
  { id: 4, name: 'Focus', tag: 'Tasks' },
  { id: 5, name: 'Zen', tag: 'Minimal' },
]

export const WEATHER_ICON_MAP: Record<string, { day: string; night: string }> = {
  clear: { day: '/weather-icons/clear_day.webp', night: '/weather-icons/clear_night.webp' },
  clouds: { day: '/weather-icons/cloud_day.webp', night: '/weather-icons/cloud_night.webp' },
  rain: { day: '/weather-icons/rain.webp', night: '/weather-icons/rain.webp' },
  drizzle: { day: '/weather-icons/rain.webp', night: '/weather-icons/rain.webp' },
  thunderstorm: { day: '/weather-icons/thunder.webp', night: '/weather-icons/thunder.webp' },
  snow: { day: '/weather-icons/snow_day.webp', night: '/weather-icons/snow_day.webp' },
  fog: { day: '/weather-icons/fog_day.webp', night: '/weather-icons/fog_night.webp' },
  mist: { day: '/weather-icons/fog_day.webp', night: '/weather-icons/fog_night.webp' },
  haze: { day: '/weather-icons/haze.webp', night: '/weather-icons/haze.webp' },
  wind: { day: '/weather-icons/wind_day.webp', night: '/weather-icons/wind_day.webp' },
}

export const VOID_VERSION = '1.0.0'
export const GITHUB_REPO_URL = 'https://github.com/VoidUI/void-ui'

