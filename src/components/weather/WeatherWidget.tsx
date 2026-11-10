import React, { useEffect, useState } from 'react'
import { MapPin, Wind, Droplets, RefreshCw } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fetchWeather, getWeatherIconPath } from '../../utils/weather'

export const WeatherWidget: React.FC = () => {
  const weatherConfig = useStore((s) => s.weatherConfig)
  const weatherData = useStore((s) => s.weatherData)
  const setWeatherData = useStore((s) => s.setWeatherData)
  const theme = useStore((s) => s.theme)

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
    // Refresh weather every 20 minutes
    const interval = setInterval(loadWeather, 20 * 60 * 1000)
    return () => clearInterval(interval)
  }, [weatherConfig.city, weatherConfig.unit, weatherConfig.useAutoLocation])

  if (!weatherData) {
    return (
      <div className="void-card p-6 flex items-center justify-center min-h-[180px]">
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-nothing-red" />
          <span>INITIALIZING WEATHER...</span>
        </div>
      </div>
    )
  }

  const iconPath = getWeatherIconPath(weatherData.iconKey, weatherData.isDay)
  const isLight = theme === 'light'

  return (
    <div className="void-card p-5 select-none relative overflow-hidden flex flex-col justify-between group">
      {/* Top Header: Location & Refresh */}
      <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
          <MapPin className="w-3.5 h-3.5 text-nothing-red shrink-0" />
          <span className="truncate font-sans font-medium text-white/90">
            {weatherData.city}
          </span>
          {weatherData.country && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-white/10 uppercase">
              {weatherData.country}
            </span>
          )}
        </div>

        <button
          onClick={loadWeather}
          className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
          title="Refresh Weather"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-nothing-red' : ''}`} />
        </button>
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
            {weatherData.condition}
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

      {/* Footer Metrics: Humidity & Wind */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs font-mono text-white/60">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-caelestia-cyan" />
          <span>{weatherData.humidity}% Hum</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <Wind className="w-3.5 h-3.5 text-white/50" />
          <span>{weatherData.windSpeed} {weatherConfig.unit === 'F' ? 'mph' : 'km/h'}</span>
        </div>
      </div>
    </div>
  )
}

