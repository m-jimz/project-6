import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [city, setCity] = useState('London')

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiKey = '6161a988b0eb4b2f8556cb5341bbb399'
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data')
        }
        
        const data = await response.json()
        setWeatherData(data.list.slice(0, 10))
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
      </header>

      <main className="app-main">
        {loading && <div className="loading">Loading weather data...</div>}
        {error && <div className="error">Error: {error}</div>}

        
        {!loading && !error && (
          <>
            <h2 className="forecast-title">5-Day Weather Forecast for {city}</h2>
            <div className="weather-dashboard">
              {weatherData.map((item, index) => (
                <div key={index} className="weather-card">
                  <div className="card-header">
                    <h3>{new Date(item.dt * 1000).toLocaleString()}</h3>
                  </div>
                  <div className="card-content">
                    <div className="weather-item">
                      <span className="label">Temperature:</span>
                      <span className="value">{item.main.temp}°C</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Feels Like:</span>
                      <span className="value">{item.main.feels_like}°C</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Humidity:</span>
                      <span className="value">{item.main.humidity}%</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Pressure:</span>
                      <span className="value">{item.main.pressure} hPa</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Wind Speed:</span>
                      <span className="value">{item.wind.speed} m/s</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Condition:</span>
                      <span className="value">{item.weather[0].main}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Description:</span>
                      <span className="value">{item.weather[0].description}</span>
                    </div>
                    <div className="weather-item">
                      <span className="label">Cloud Cover:</span>
                      <span className="value">{item.clouds.all}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
