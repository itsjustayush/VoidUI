import { WeatherData, WeatherConfig } from '../types'
import { WEATHER_ICON_MAP } from './constants'

const CACHE_KEY = 'void_weather_cache'
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export async function fetchWeather(config: WeatherConfig): Promise<WeatherData | null> {
  // Check local cache
  try {
    const rawCache = localStorage.getItem(CACHE_KEY)
    if (rawCache) {
      const cached = JSON.parse(rawCache) as WeatherData
      if (Date.now() - cached.updatedAt < CACHE_TTL) {
        return cached
      }
    }
  } catch (err) {
    console.warn('Weather cache read error:', err)
  }

  // If user provided OpenWeatherMap API Key, use it
  if (config.apiKey && config.apiKey.trim()) {
    return fetchFromOpenWeather(config)
  }

  // Otherwise, use free Open-Meteo
  return fetchFromOpenMeteo(config)
}

async function fetchFromOpenMeteo(config: WeatherConfig): Promise<WeatherData | null> {
  try {
    let lat = 51.5074
    let lon = -0.1278
    let cityName = config.city || 'London'
    let countryCode = 'UK'

    // Try geolocation if enabled
    if (config.useAutoLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
        })
        lat = pos.coords.latitude
        lon = pos.coords.longitude
        cityName = 'My Location'
      } catch {
        // Geolocation failed or denied; fallback to city geocoding
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
        )
        const geoData = await geoRes.json()
        if (geoData.results && geoData.results[0]) {
          lat = geoData.results[0].latitude
          lon = geoData.results[0].longitude
          cityName = geoData.results[0].name
          countryCode = geoData.results[0].country_code || ''
        }
      }
    } else {
      // Geocode city
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      )
      const geoData = await geoRes.json()
      if (geoData.results && geoData.results[0]) {
        lat = geoData.results[0].latitude
        lon = geoData.results[0].longitude
        cityName = geoData.results[0].name
        countryCode = geoData.results[0].country_code || ''
      }
    }

    const tempUnit = config.unit === 'F' ? 'fahrenheit' : 'celsius'
    const speedUnit = config.unit === 'F' ? 'mph' : 'kmh'

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&wind_speed_unit=${speedUnit}&timezone=auto`

    const res = await fetch(weatherUrl)
    if (!res.ok) throw new Error('Open-Meteo fetch failed')
    const data = await res.json()

    const current = data.current
    const daily = data.daily
    const isDay = current.is_day === 1
    const wCode = current.weather_code
    const condition = mapWmoCodeToCondition(wCode)
    const iconKey = mapConditionToIconKey(condition)

    const result: WeatherData = {
      temp: Math.round(current.temperature_2m),
      tempMin: Math.round(daily.temperature_2m_min[0] || current.temperature_2m),
      tempMax: Math.round(daily.temperature_2m_max[0] || current.temperature_2m),
      condition,
      city: cityName,
      country: countryCode,
      humidity: current.relative_humidity_2m || 50,
      windSpeed: Math.round(current.wind_speed_10m || 0),
      iconKey,
      isDay,
      updatedAt: Date.now(),
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(result))
    return result
  } catch (err) {
    console.error('Open-Meteo error:', err)
    return getFallbackWeather(config)
  }
}

async function fetchFromOpenWeather(config: WeatherConfig): Promise<WeatherData | null> {
  try {
    const units = config.unit === 'F' ? 'imperial' : 'metric'
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(config.city)}&units=${units}&appid=${config.apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('OpenWeather fetch failed')
    const data = await res.json()

    const hours = new Date().getHours()
    const isDay = hours >= 6 && hours < 19
    const mainCond = data.weather[0]?.main?.toLowerCase() || 'clear'
    const iconKey = mapConditionToIconKey(mainCond)

    const result: WeatherData = {
      temp: Math.round(data.main.temp),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      condition: data.weather[0]?.main || 'Clear',
      city: data.name,
      country: data.sys?.country || '',
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      iconKey,
      isDay,
      updatedAt: Date.now(),
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(result))
    return result
  } catch (err) {
    console.error('OpenWeather error:', err)
    return getFallbackWeather(config)
  }
}

function getFallbackWeather(config: WeatherConfig): WeatherData {
  const isF = config.unit === 'F'
  return {
    temp: isF ? 68 : 20,
    tempMin: isF ? 59 : 15,
    tempMax: isF ? 73 : 23,
    condition: 'Partly Cloudy',
    city: config.city || 'London',
    country: 'UK',
    humidity: 58,
    windSpeed: isF ? 8 : 14,
    iconKey: 'clouds',
    isDay: true,
    updatedAt: Date.now(),
  }
}

function mapWmoCodeToCondition(code: number): string {
  if (code === 0) return 'Clear'
  if (code === 1 || code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code >= 45 && code <= 48) return 'Fog'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 61 && code <= 65) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain Showers'
  if (code >= 85 && code <= 86) return 'Snow Showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Clear'
}

function mapConditionToIconKey(cond: string): string {
  const c = cond.toLowerCase()
  if (c.includes('thunder')) return 'thunderstorm'
  if (c.includes('snow') || c.includes('ice') || c.includes('hail')) return 'snow'
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rain'
  if (c.includes('cloud') || c.includes('overcast')) return 'clouds'
  if (c.includes('fog') || c.includes('mist')) return 'fog'
  if (c.includes('haze') || c.includes('smoke') || c.includes('dust')) return 'haze'
  return 'clear'
}

export function getWeatherIconPath(iconKey: string, isDay = true): string {
  const item = WEATHER_ICON_MAP[iconKey] || WEATHER_ICON_MAP['clear']
  return isDay ? item.day : item.night
}

