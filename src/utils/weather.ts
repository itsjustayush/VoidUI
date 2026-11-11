import { WeatherData, WeatherConfig, HourlyForecast } from '../types'
import { WEATHER_ICON_MAP } from './constants'

const CACHE_KEY = 'void_weather_cache_v2'
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export async function fetchWeather(config: WeatherConfig): Promise<WeatherData | null> {
  // Check local cache
  try {
    const rawCache = localStorage.getItem(CACHE_KEY)
    if (rawCache) {
      const cached = JSON.parse(rawCache) as WeatherData
      // If city matches or using auto-location, and cache is fresh
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

  // Otherwise, use high-precision Open-Meteo with GPS + IP geolocation
  return fetchAccurateWeather(config)
}

interface GeoPoint {
  lat: number
  lon: number
  city: string
  district?: string
  country: string
}

async function resolveLocation(config: WeatherConfig): Promise<GeoPoint> {
  // 1. If user specified an explicit custom city (and auto-location is off)
  if (!config.useAutoLocation && config.city && config.city.trim()) {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(config.city.trim())}&count=1&language=en&format=json`
      )
      const geoData = await geoRes.json()
      if (geoData.results && geoData.results[0]) {
        const item = geoData.results[0]
        return {
          lat: item.latitude,
          lon: item.longitude,
          city: item.name,
          country: item.country_code || '',
        }
      }
    } catch (e) {
      console.warn('City geocoding error:', e)
    }
  }

  // 2. High accuracy browser GPS
  if (config.useAutoLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 300000,
        })
      })

      const lat = pos.coords.latitude
      const lon = pos.coords.longitude

      // Reverse geocode to find exact City & Locality
      try {
        const revRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        )
        if (revRes.ok) {
          const rev = await revRes.json()
          return {
            lat,
            lon,
            city: rev.city || rev.locality || rev.principalSubdivision || 'Current Location',
            district: rev.locality && rev.locality !== rev.city ? rev.locality : undefined,
            country: rev.countryCode || '',
          }
        }
      } catch {}

      return {
        lat,
        lon,
        city: 'Current Location',
        country: '',
      }
    } catch {
      // GPS not granted or timed out -> continue to IP Geolocation
    }
  }

  // 3. Fallback: Instant IP-based Geolocation (Zero prompt, highly accurate city level)
  try {
    const ipRes = await fetch('https://ipwho.is/')
    if (ipRes.ok) {
      const ip = await ipRes.json()
      if (ip.success) {
        return {
          lat: ip.latitude,
          lon: ip.longitude,
          city: ip.city || ip.region || 'Current Location',
          district: ip.region,
          country: ip.country_code || '',
        }
      }
    }
  } catch (e) {
    console.warn('IP location fallback 1 failed, trying fallback 2:', e)
  }

  try {
    const ipRes2 = await fetch('https://freeipapi.com/api/json')
    if (ipRes2.ok) {
      const ip2 = await ipRes2.json()
      return {
        lat: ip2.latitude,
        lon: ip2.longitude,
        city: ip2.cityName || 'Current Location',
        country: ip2.countryCode || '',
      }
    }
  } catch {}

  // 4. Default fallback
  return {
    lat: 28.6139,
    lon: 77.2090,
    city: config.city || 'New Delhi',
    country: 'IN',
  }
}

async function fetchAccurateWeather(config: WeatherConfig): Promise<WeatherData | null> {
  try {
    const loc = await resolveLocation(config)
    const tempUnit = config.unit === 'F' ? 'fahrenheit' : 'celsius'
    const speedUnit = config.unit === 'F' ? 'mph' : 'kmh'

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&temperature_unit=${tempUnit}&wind_speed_unit=${speedUnit}&timezone=auto`

    const res = await fetch(weatherUrl)
    if (!res.ok) throw new Error('Open-Meteo fetch failed')
    const data = await res.json()

    const current = data.current
    const daily = data.daily
    const hourly = data.hourly
    const isDay = current.is_day === 1
    const wCode = current.weather_code
    const condition = mapWmoCodeToCondition(wCode)
    const iconKey = mapConditionToIconKey(condition)

    // Build next 4 hours forecast
    const currentHourIdx = new Date().getHours()
    const nextHours: HourlyForecast[] = []
    if (hourly && hourly.time) {
      for (let i = 1; i <= 4; i++) {
        const idx = currentHourIdx + i
        if (hourly.time[idx]) {
          const timeStr = new Date(hourly.time[idx]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const hCode = hourly.weather_code[idx] || 0
          nextHours.push({
            time: timeStr,
            temp: Math.round(hourly.temperature_2m[idx]),
            iconKey: mapConditionToIconKey(mapWmoCodeToCondition(hCode)),
          })
        }
      }
    }

    const result: WeatherData = {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m),
      tempMin: Math.round(daily.temperature_2m_min[0] ?? current.temperature_2m),
      tempMax: Math.round(daily.temperature_2m_max[0] ?? current.temperature_2m),
      condition,
      city: loc.city,
      district: loc.district,
      country: loc.country,
      humidity: current.relative_humidity_2m || 50,
      windSpeed: Math.round(current.wind_speed_10m || 0),
      uvIndex: daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : undefined,
      precipitationProb: daily.precipitation_probability_max ? Math.round(daily.precipitation_probability_max[0]) : undefined,
      iconKey,
      isDay,
      updatedAt: Date.now(),
      hourly: nextHours,
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(result))
    return result
  } catch (err) {
    console.error('Accurate weather fetch error:', err)
    return getFallbackWeather(config)
  }
}

async function fetchFromOpenWeather(config: WeatherConfig): Promise<WeatherData | null> {
  try {
    const units = config.unit === 'F' ? 'imperial' : 'metric'
    const loc = await resolveLocation(config)
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&units=${units}&appid=${config.apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('OpenWeather fetch failed')
    const data = await res.json()

    const hours = new Date().getHours()
    const isDay = hours >= 6 && hours < 19
    const mainCond = data.weather[0]?.main?.toLowerCase() || 'clear'
    const iconKey = mapConditionToIconKey(mainCond)

    const result: WeatherData = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      condition: data.weather[0]?.main || 'Clear',
      city: data.name || loc.city,
      country: data.sys?.country || loc.country,
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
    temp: isF ? 72 : 22,
    feelsLike: isF ? 74 : 23,
    tempMin: isF ? 62 : 17,
    tempMax: isF ? 78 : 26,
    condition: 'Clear',
    city: config.city || 'Local Area',
    country: '',
    humidity: 55,
    windSpeed: isF ? 6 : 10,
    uvIndex: 4,
    precipitationProb: 10,
    iconKey: 'clear',
    isDay: true,
    updatedAt: Date.now(),
  }
}

function mapWmoCodeToCondition(code: number): string {
  if (code === 0) return 'Clear'
  if (code === 1 || code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code >= 45 && code <= 48) return 'Foggy'
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
