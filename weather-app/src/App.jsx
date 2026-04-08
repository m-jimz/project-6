import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [weatherData, setWeatherData] = useState([])
  const [minutelyData, setMinutelyData] = useState([])
  const [alertsData, setAlertsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [city, setCity] = useState('London')
  const [cityInput, setCityInput] = useState('London')
  const [searchQuery, setSearchQuery] = useState('')
  const [humidityFilter, setHumidityFilter] = useState('all')

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiKey = '6161a988b0eb4b2f8556cb5341bbb399'
        const currentUrl = `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(city)}&key=${apiKey}&include=minutely`
        const alertsUrl = `https://api.weatherbit.io/v2.0/alerts?city=${encodeURIComponent(city)}&key=${apiKey}`

        const [currentResponse, alertsResponse] = await Promise.all([
          fetch(currentUrl),
          fetch(alertsUrl)
        ])

        if (!currentResponse.ok) {
          throw new Error('Failed to fetch weather data')
        }

        const currentData = await currentResponse.json()
        setWeatherData(Array.isArray(currentData.data) ? currentData.data : [])
        setMinutelyData(Array.isArray(currentData.minutely) ? currentData.minutely : [])

        if (alertsResponse.ok) {
          const alertsDataResponse = await alertsResponse.json()
          setAlertsData(Array.isArray(alertsDataResponse.alerts) ? alertsDataResponse.alerts : [])
        } else {
          setAlertsData([])
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching weather:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [city])

  const handleCityChange = (e) => {
    setCityInput(e.target.value)
  }

  const handleCitySubmit = () => {
    const nextCity = cityInput.trim()
    if (nextCity) {
      setCity(nextCity)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleHumidityChange = (e) => {
    setHumidityFilter(e.target.value)
  }

  // Helper function to categorize humidity
  const getHumidityCategory = (humidity) => {
    const humidityValue = Number(humidity)

    if (Number.isNaN(humidityValue)) return 'unknown'
    if (humidityValue <= 33) return 'low'
    if (humidityValue <= 66) return 'medium'
    return 'high'
  }

  // Filter weather data based on search query AND humidity filter
  const filteredWeatherData = weatherData.filter(item => {
    // Search filter (city, observation time, condition)
    const cityName = (item.city_name || '').toLowerCase()
    const observationTime = (item.ob_time || item.datetime || '').toLowerCase()
    const condition = (item.weather?.description || '').toLowerCase()
    const timezone = (item.timezone || '').toLowerCase()
    const humidityValue = String(item.rh ?? '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      cityName.includes(query) ||
      observationTime.includes(query) ||
      condition.includes(query) ||
      timezone.includes(query) ||
      humidityValue.includes(query)

    // Humidity filter
    const humidityCategory = getHumidityCategory(item.rh)
    const matchesHumidity = humidityFilter === 'all' || humidityCategory === humidityFilter

    return matchesSearch && matchesHumidity
  })

  // Calculate summary statistics
  const calculateStatistics = () => {
    if (filteredWeatherData.length === 0) return null

    const avgTemp = (filteredWeatherData.reduce((sum, item) => sum + item.temp, 0) / filteredWeatherData.length).toFixed(1)
    const avgHumidity = Math.round(filteredWeatherData.reduce((sum, item) => sum + item.rh, 0) / filteredWeatherData.length)
    const maxWindSpeed = Math.max(...filteredWeatherData.map(item => item.wind_spd)).toFixed(1)

    return {
      avgTemp,
      avgHumidity,
      maxWindSpeed
    }
  }

  const stats = calculateStatistics()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Weather Dash</h1>
        <div className="city-selector">
          <input
            type="text"
            placeholder="Enter city name"
            value={cityInput}
            onChange={handleCityChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCitySubmit()
              }
            }}
            className="city-input"
          />
          <button type="button" className="city-button" onClick={handleCitySubmit}>
            Search City
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Filter by city, time, condition, timezone, or humidity..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <select
            value={humidityFilter}
            onChange={handleHumidityChange}
            className="humidity-filter"
          >
            <option value="all">All Humidity Levels</option>
            <option value="low">Low Humidity (0-33%)</option>
            <option value="medium">Medium Humidity (34-66%)</option>
            <option value="high">High Humidity (67-100%)</option>
          </select>
        </div>
      </header>

      <main className="app-main">
        {loading && <div className="loading">Loading weather data...</div>}
        {error && <div className="error">Error: {error}</div>}

        
        {!loading && !error && (
          <>
            <h2 className="forecast-title">Current Weather for {city}</h2>
            {minutelyData.length > 0 && (
              <p className="forecast-title">Minutely updates available: {minutelyData.length}</p>
            )}
            
            {stats && (
              <div className="summary-statistics">
                <div className="stat-card">
                  <span className="stat-label">Average Temperature</span>
                  <span className="stat-value">{stats.avgTemp}°C</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Average Humidity</span>
                  <span className="stat-value">{stats.avgHumidity}%</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Max Wind Speed</span>
                  <span className="stat-value">{stats.maxWindSpeed} m/s</span>
                </div>
              </div>
            )}

            <div className="summary-statistics">
              <div className="stat-card">
                <span className="stat-label">Active Weather Alerts</span>
                <span className="stat-value">{alertsData.length}</span>
              </div>
            </div>

            {alertsData.length > 0 && (
              <div className="weather-dashboard">
                {alertsData.map((alert, index) => (
                  <div key={`${alert.title || 'alert'}-${index}`} className="weather-card">
                    <div className="card-header">
                      <h3>{alert.title || 'Weather Alert'}</h3>
                    </div>
                    <div className="card-content">
                      <div className="weather-item">
                        <span className="label">Severity:</span>
                        <span className="value">{alert.severity || 'N/A'}</span>
                      </div>
                      <div className="weather-item">
                        <span className="label">Effective:</span>
                        <span className="value">{alert.effective_local || 'N/A'}</span>
                      </div>
                      <div className="weather-item">
                        <span className="label">Expires:</span>
                        <span className="value">{alert.expires_local || alert.ends_local || 'N/A'}</span>
                      </div>
                      <div className="weather-item">
                        <span className="label">Regions:</span>
                        <span className="value">{Array.isArray(alert.regions) ? alert.regions.join(', ') : 'N/A'}</span>
                      </div>
                      <div className="weather-item">
                        <span className="label">Description:</span>
                        <span className="value">{alert.description || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="weather-dashboard">
              {filteredWeatherData.length === 0 ? (
                <div className="no-results">
                  <p>No weather data matches your search. Try a different search term.</p>
                </div>
              ) : (
                filteredWeatherData.map((item, index) => (
                <div key={index} className="weather-card">
                  <div className="card-header">
                    <h3>{item.city_name}, {item.state_code || item.country_code}</h3>
                  </div>
                  <div className="card-content">
                    <div className="weather-item">
                      <span className="label">Observed:</span>
                      <span className="value">{item.ob_time || item.datetime || 'N/A'}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Temperature:</span>
                      <span className="value">{item.temp}°C</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Feels Like:</span>
                      <span className="value">{item.app_temp}°C</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Wind Speed:</span>
                      <span className="value">{item.wind_spd} m/s</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Wind Direction:</span>
                      <span className="value">{item.wind_cdir_full || item.wind_cdir || 'N/A'}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Wind Gust:</span>
                      <span className="value">{item.gust ?? 'N/A'} m/s</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Humidity:</span>
                      <span className="value">{item.rh}%</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Pressure:</span>
                      <span className="value">{item.pres} hPa</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Condition:</span>
                      <span className="value">{item.weather?.description || 'N/A'}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">AQI:</span>
                      <span className="value">{item.aqi ?? 'N/A'}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">UV:</span>
                      <span className="value">{item.uv ?? 'N/A'}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Visibility:</span>
                      <span className="value">{item.vis ?? 'N/A'} km</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Sunrise / Sunset:</span>
                      <span className="value">{item.sunrise || 'N/A'} / {item.sunset || 'N/A'}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Cloud Cover:</span>
                      <span className="value">{item.clouds}%</span>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
