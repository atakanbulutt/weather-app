import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { SavedCity, WeatherData } from '../types/weather';
import { WeatherService } from '../services/weatherService';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const saved = localStorage.getItem('savedCities');
    if (saved) {
      setSavedCities(JSON.parse(saved));
    }
  }, []);

  const saveCity = (city: SavedCity) => {
    const updated = [...savedCities, city];
    setSavedCities(updated);
    localStorage.setItem('savedCities', JSON.stringify(updated));
  };

  const removeCity = (cityId: number) => {
    const updated = savedCities.filter(city => city.id !== cityId);
    setSavedCities(updated);
    localStorage.setItem('savedCities', JSON.stringify(updated));
  };

  const updateCityWeather = async (cityId: number) => {
    const city = savedCities.find(c => c.id === cityId);
    if (!city) return;

    try {
      const weatherData = await WeatherService.getCurrentWeather(city.name, 'metric', language === 'tr' ? 'tr' : 'en');
      const updatedCities = savedCities.map(c => 
        c.id === cityId 
          ? { ...c, weatherData, lastUpdated: Date.now() }
          : c
      );
      setSavedCities(updatedCities);
      localStorage.setItem('savedCities', JSON.stringify(updatedCities));
    } catch (error) {
      console.error('Error updating weather for city:', city.name, error);
    }
  };

  const handleAddCity = async () => {
    if (!newCity.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const weatherData = await WeatherService.getCurrentWeather(newCity, 'metric', language === 'tr' ? 'tr' : 'en');
      
      const newCityData: SavedCity = {
        id: Date.now(),
        name: weatherData.name,
        country: weatherData.sys.country,
        coord: weatherData.coord,
        lastUpdated: Date.now(),
        weatherData: weatherData,
      };
      
      saveCity(newCityData);
      setNewCity('');
    } catch (error) {
      setError(`Şehir bulunamadı: ${newCity}`);
      console.error('Error adding city:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllWeather = async () => {
    setLoading(true);
    try {
      const updatedCities = await Promise.all(
        savedCities.map(async (city) => {
          try {
            const weatherData = await WeatherService.getCurrentWeather(city.name, 'metric', language === 'tr' ? 'tr' : 'en');
            return { ...city, weatherData, lastUpdated: Date.now() };
          } catch (error) {
            console.error(`Error updating weather for ${city.name}:`, error);
            return city;
          }
        })
      );
      setSavedCities(updatedCities);
      localStorage.setItem('savedCities', JSON.stringify(updatedCities));
    } catch (error) {
      console.error('Error refreshing weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTemperature = (temp: number) => {
    return `${Math.round(temp)}°C`;
  };

  const getWeatherIcon = (iconCode: string) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWeatherDescription = (description: string) => {
    const descriptions = t.weather.weatherDescriptions as Record<string, string>;
    return descriptions[description] || description;
  };

  return (
    <div className="dashboard-page">
      <header className="app-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.dashboard.title}
        </motion.h1>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Ana Sayfa
          </Link>
          <Link to="/settings" className="nav-link">
            ⚙️
          </Link>
        </nav>
      </header>

      <main className="main-content">
        <div className="add-city-section">
          <h3>{t.dashboard.addCity}</h3>
          <div className="add-city-form">
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder={t.app.searchPlaceholder}
              className="city-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
            />
            <button 
              onClick={handleAddCity} 
              className="add-button"
              disabled={loading}
            >
              {loading ? 'Ekleniyor...' : t.dashboard.addCity}
            </button>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}
        </div>

        {savedCities.length > 0 && (
          <div className="refresh-section">
            <button 
              onClick={refreshAllWeather} 
              className="refresh-button"
              disabled={loading}
            >
             {loading ? t.dashboard.loading : t.dashboard.refresh}
            </button>
          </div>
        )}

        <div className="saved-cities-section">
          <h3>{t.dashboard.savedCities} ({savedCities.length})</h3>
          <div className="cities-grid">
            {savedCities.map((city) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="city-card"
              >
                <div className="city-header">
                  <h4>{city.name}</h4>
                  <span className="country">{city.country}</span>
                </div>
                
                {city.weatherData ? (
                  <div className="weather-info">
                    <div className="current-weather">
                      <img 
                        src={getWeatherIcon(city.weatherData.weather[0].icon)} 
                        alt={city.weatherData.weather[0].description}
                        className="weather-icon"
                      />
                      <div className="temperature">
                        {formatTemperature(city.weatherData.main.temp)}
                      </div>
                      <div className="description">
                        {getWeatherDescription(city.weatherData.weather[0].description)}
                      </div>
                    </div>
                    
                    <div className="weather-details">
                      <div className="detail-item">
                        <span>{t.weather.feelsLike}:</span>
                        <span>{formatTemperature(city.weatherData.main.feels_like)}</span>
                      </div>
                      <div className="detail-item">
                        <span>{t.weather.min}:</span>
                        <span>{formatTemperature(city.weatherData.main.temp_min)} / {formatTemperature(city.weatherData.main.temp_max)}</span>
                      </div>
                      <div className="detail-item">
                        <span>{t.weather.humidity}:</span>
                        <span>{city.weatherData.main.humidity}%</span>
                      </div>
                      <div className="detail-item">
                        <span>{t.weather.windSpeed}:</span>
                        <span>{city.weatherData.wind.speed} m/s</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-weather-data">
                    <p>{t.weather.noWeatherData}</p>
                    <button 
                      onClick={() => updateCityWeather(city.id)}
                      className="update-weather-button"
                    >
                      {t.weather.updateWeather}
                    </button>
                  </div>
                )}
                
                <div className="city-footer">
                  <p className="last-updated">
                    {t.weather.lastUpdated}: {new Date(city.lastUpdated).toLocaleString('tr-TR')}
                  </p>
                  <button
                    onClick={() => removeCity(city.id)}
                    className="remove-button"
                  >
                    {t.dashboard.removeCity}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
