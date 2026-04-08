import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [city, setCity] = useState('London')
  const [searchQuery, setSearchQuery] = useState('')
  const [humidityFilter, setHumidityFilter] = useState('all')

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiKey = '6161a988b0eb4b2f8556cb5341bbb399'
        const url = `https://api.weatherbit.io/v2.0/forecast/3hourly?city=${encodeURIComponent(city)}&key=${apiKey}&units=M`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to fetch weather data')
        }

        const data = await response.json()
        setWeatherData(data.data.slice(0, 10))
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
    setCity(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleHumidityChange = (e) => {
    setHumidityFilter(e.target.value)
  }

  // Helper function to categorize humidity
  const getHumidityCategory = (humidity) => {
    if (humidity <= 33) return 'low'
    if (humidity <= 66) return 'medium'
    return 'high'
  }

  // Filter weather data based on search query AND humidity filter
  const filteredWeatherData = weatherData.filter(item => {
    // Search filter (date, condition, description)
    const date = (item.timestamp_local || '').toLowerCase()
    const condition = (item.weather?.description || '').toLowerCase()
    const description = (item.weather?.description || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch = date.includes(query) || condition.includes(query) || description.includes(query)

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
            value={city}
            onChange={handleCityChange}
            className="city-input"
          />
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by date, condition, or description..."
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
            <h2 className="forecast-title">5-Day Weather Forecast for {city}</h2>
            
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
            
            <div className="weather-dashboard">
              {filteredWeatherData.length === 0 ? (
                <div className="no-results">
                  <p>No weather data matches your search. Try a different search term.</p>
                </div>
              ) : (
                filteredWeatherData.map((item, index) => (
                <div key={index} className="weather-card">
                  <div className="card-header">
                    <h3>{new Date(item.timestamp_local).toLocaleString()}</h3>
                  </div>
                  <div className="card-content">
                    <div className="weather-item">
                      <span className="label">Temperature:</span>
                      <span className="value">{item.temp}°C</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Wind Speed:</span>
                      <span className="value">{item.wind_spd} m/s</span>
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
                      <span className="label">Precipitation Chance:</span>
                      <span className="value">{item.pop}%</span>
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
