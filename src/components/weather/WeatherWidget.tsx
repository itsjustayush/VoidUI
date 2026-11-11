import React, { useEffect, useState } from 'react'
import { MapPin, Wind, Droplets, RefreshCw, Sun, Umbrella, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fetchWeather, getWeatherIconPath } from '../../utils/weather'

export const WeatherWidget: React.FC = () => {
  const weatherConfig = useStore((s) => s.weatherConfig)
  const weatherData = useStore((s) => s.weatherData)
  const setWeatherData = useStore((s) => s.setWeatherData)
  const theme = useStore((s) => s.theme)
  const minimized = useStore((s) => !!s.minimizedWidgets['weather'])
  const toggleMinimized = useStore((s) => s.toggleWidgetMinimized)

  const [loading, setLoading] = useState(false)

  const loadWeather = async () => {
    setLoading(true)
    try {
      const data = await fetchWeather(weatherConfig)
      if (data) setWeatherData(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeather()
    const interval = setInterval(loadWeather, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [weatherConfig.city, weatherConfig.unit, weatherConfig.useAutoLocation])

  if (!weatherData) {
    return (
      <div className="void-card p-4 flex items-center justify-center min-h-[140px]">
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-nothing-red" />
          <span>LOCATING & FETCHING WEATHER...</span>
        </div>
      </div>
    )
  }

  const iconPath = getWeatherIconPath(weatherData.iconKey, weatherData.isDay)
  const isLight = theme === 'light'

  // Minimized Compact State (Self-Aware Layout Pill)
  if (minimized) {
    return (
      <div className="void-card p-3 select-none flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <img
            src={iconPath}
            alt={weatherData.condition}
            className="w-8 h-8 object-contain"
            style={isLight ? { filter: 'invert(0.9)' } : {}}
          />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-ndot text-lg text-white font-bold">{weatherData.temp}°{weatherConfig.unit}</span>
              <span className="text-xs text-white/60 font-sans">{weatherData.condition}</span>
            </div>
            <div className="text-[10px] font-mono text-white/40 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-nothing-red" />
              <span>{weatherData.city}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadWeather}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-nothing-red' : ''}`} />
          </button>
          <button
            onClick={() => toggleMinimized('weather')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
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
    <div className="void-card p-5 select-none relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300 group">
      {/* Top Header: Location, Refresh, Minimize */}
      <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
        <div className="flex items-center gap-1.5 truncate max-w-[210px]">
          <MapPin className="w-3.5 h-3.5 text-nothing-red shrink-0" />
          <span className="truncate font-sans font-medium text-white/90">
            {weatherData.city}
          </span>
          {weatherData.district && (
            <span className="text-white/40 truncate text-[11px] hidden sm:inline">
              ({weatherData.district})
            </span>
          )}
          {weatherData.country && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-white/10 uppercase shrink-0">
              {weatherData.country}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadWeather}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Refresh Weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-nothing-red' : ''}`} />
          </button>

          <button
            onClick={() => toggleMinimized('weather')}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Minimize card"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body: Temperature & Weather Icon */}
      <div className="flex items-center justify-between my-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-ndot text-5xl sm:text-6xl text-white tracking-tight">
              {weatherData.temp}
            </span>
            <span className="font-ntype text-xl text-nothing-red font-bold">
              °{weatherConfig.unit}
            </span>
          </div>
          <div className="text-sm font-sans text-white/80 font-medium capitalize mt-0.5">
            {weatherData.condition} • Feels like {weatherData.feelsLike}°
          </div>
          <div className="text-[11px] font-mono text-white/40 mt-0.5">
            H: {weatherData.tempMax}° • L: {weatherData.tempMin}°
          </div>
        </div>

        {/* Nothing Weather Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center relative">
          <img
            src={iconPath}
            alt={weatherData.condition}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
            style={isLight ? { filter: 'invert(0.9)' } : {}}
          />
        </div>
      </div>

      {/* Mini Hourly Forecast if available */}
      {weatherData.hourly && weatherData.hourly.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 py-2 my-1 border-t border-b border-white/5 text-center">
          {weatherData.hourly.map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-white/40">{h.time}</span>
              <img
                src={getWeatherIconPath(h.iconKey, weatherData.isDay)}
                alt="hourly"
                className="w-5 h-5 object-contain my-0.5"
                style={isLight ? { filter: 'invert(0.9)' } : {}}
              />
              <span className="text-[11px] font-mono text-white/80 font-medium">{h.temp}°</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono text-white/60">
        <div className="flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5 text-caelestia-cyan" />
          <span>{weatherData.humidity}%</span>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <Wind className="w-3.5 h-3.5 text-white/50" />
          <span>{weatherData.windSpeed} {weatherConfig.unit === 'F' ? 'mph' : 'km/h'}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          {weatherData.precipitationProb !== undefined ? (
            <>
              <Umbrella className="w-3.5 h-3.5 text-blue-400" />
              <span>{weatherData.precipitationProb}%</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              <span>UV {weatherData.uvIndex ?? 3}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
