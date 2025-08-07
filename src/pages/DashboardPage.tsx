import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { SavedCity } from '../types/weather';
import { WeatherService } from '../services/weatherService';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [newCity, setNewCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); 
  const [refreshProgress, setRefreshProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();

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
    const city = savedCities.find(c => c.id === cityId);
    if (city) {
      // Cache'den şehir verilerini temizle
      queryClient.removeQueries({ queryKey: ['weather', city.name] });
      queryClient.removeQueries({ queryKey: ['forecast'] });
    }
    
    const updated = savedCities.filter(city => city.id !== cityId);
    setSavedCities(updated);
    localStorage.setItem('savedCities', JSON.stringify(updated));
  };

  // React Query mutation for adding city
  const addCityMutation = useMutation({
    mutationFn: async (cityName: string) => {
      return await WeatherService.getCurrentWeather(cityName, 'metric', language === 'tr' ? 'tr' : 'en');
    },
    onSuccess: (weatherData) => {
      const isDuplicate = savedCities.some(city => 
        city.name.toLowerCase() === weatherData.name.toLowerCase() ||
        (city.country && weatherData.sys.country && 
         city.name.toLowerCase() === weatherData.name.toLowerCase() && 
         city.country.toLowerCase() === weatherData.sys.country.toLowerCase())
      );

      if (isDuplicate) {
        setError(`${weatherData.name} zaten kayıtlı!`);
        setTimeout(() => setError(null), 2000);
        return;
      }
      
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
      setSuccess(`${weatherData.name} başarıyla eklendi!`);
      setTimeout(() => setSuccess(null), 2000);

      // Cache'e weather data'yı kaydet
      queryClient.setQueryData(['weather', weatherData.name, language], weatherData);
      
      // Forecast için prefetch yap
      queryClient.prefetchQuery({
        queryKey: ['forecast', weatherData.coord.lat, weatherData.coord.lon, language],
        queryFn: () => WeatherService.getForecast(
          weatherData.coord.lat,
          weatherData.coord.lon,
          'metric',
          language
        ),
        staleTime: 15 * 60 * 1000,
      });
    },
    onError: (error: Error) => {
      setError(`Şehir bulunamadı: ${newCity}`);
      setTimeout(() => setError(null), 2000);
    },
  });

  // React Query mutation for updating city weather
  const updateCityWeatherMutation = useMutation({
    mutationFn: async ({ cityName, cityId }: { cityName: string; cityId: number }) => {
      const weatherData = await WeatherService.getCurrentWeather(cityName, 'metric', language === 'tr' ? 'tr' : 'en');
      return { weatherData, cityId };
    },
    onSuccess: ({ weatherData, cityId }) => {
      const updatedCities = savedCities.map(c => 
        c.id === cityId 
          ? { ...c, weatherData, lastUpdated: Date.now() }
          : c
      );
      setSavedCities(updatedCities);
      localStorage.setItem('savedCities', JSON.stringify(updatedCities));

      // Cache'i güncelle
      queryClient.setQueryData(['weather', weatherData.name, language], weatherData);
      
      // Forecast cache'ini invalidate et
      queryClient.invalidateQueries({ 
        queryKey: ['forecast', weatherData.coord.lat, weatherData.coord.lon, language] 
      });
    },
    onError: (error: Error) => {
      console.error('Error updating weather for city:', error);
    },
  });

  // Optimized batch refresh with rate limiting
  const refreshAllWeatherMutation = useMutation({
    mutationFn: async (cities: SavedCity[]) => {
      setRefreshProgress({ completed: 0, total: cities.length });
      
      // Batch processing with rate limiting (3 requests at a time)
      const batchSize = 3;
      const updatedCities: SavedCity[] = [];
      
      for (let i = 0; i < cities.length; i += batchSize) {
        const batch = cities.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchResults = await Promise.allSettled(
          batch.map(async (city) => {
            try {
              const weatherData = await WeatherService.getCurrentWeather(city.name, 'metric', language === 'tr' ? 'tr' : 'en');
              return { ...city, weatherData, lastUpdated: Date.now() };
            } catch (error) {
              console.error(`Error updating weather for ${city.name}:`, error);
              return city; // Return original city if update fails
            }
          })
        );
        
        // Add successful results to updated cities
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            updatedCities.push(result.value);
          } else {
            updatedCities.push(batch[index]); // Keep original if failed
          }
        });
        
        // Update progress
        setRefreshProgress({ completed: Math.min(i + batchSize, cities.length), total: cities.length });
        
        // Rate limiting: wait 500ms between batches
        if (i + batchSize < cities.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return updatedCities;
    },
    onSuccess: (updatedCities) => {
      setSavedCities(updatedCities);
      localStorage.setItem('savedCities', JSON.stringify(updatedCities));

      // Tüm cache'leri güncelle
      updatedCities.forEach(city => {
        if (city.weatherData) {
          queryClient.setQueryData(['weather', city.name, language], city.weatherData);
        }
      });
      
      // Progress'i sıfırla
      setRefreshProgress({ completed: 0, total: 0 });
    },
    onError: (error: Error) => {
      console.error('Error refreshing weather:', error);
      setRefreshProgress({ completed: 0, total: 0 });
    },
  });

  const updateCityWeather = async (cityId: number) => {
    const city = savedCities.find(c => c.id === cityId);
    if (!city) return;

    updateCityWeatherMutation.mutate({ cityName: city.name, cityId });
  };

  const handleAddCity = async () => {
    if (!newCity.trim()) return;
    addCityMutation.mutate(newCity);
  };

  const refreshAllWeather = async () => {
    refreshAllWeatherMutation.mutate(savedCities);
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

  // Combined loading state
  const isLoading = addCityMutation.isPending || 
                   updateCityWeatherMutation.isPending || 
                   refreshAllWeatherMutation.isPending;

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
              disabled={isLoading}
            >
              {isLoading ? 'Ekleniyor...' : t.dashboard.addCity}
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="success-message"
            >
              {success}
            </motion.div>
          )}
        </div>

        {savedCities.length > 0 && (
          <div className="refresh-section">
            <button 
              onClick={refreshAllWeather} 
              className="refresh-button"
              disabled={isLoading}
            >
              {isLoading && refreshProgress.total > 0 
                ? `Yenileniyor... (${refreshProgress.completed}/${refreshProgress.total})`
                : t.dashboard.refresh
              }
            </button>
            
            {/* Progress bar */}
            {refreshProgress.total > 0 && (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(refreshProgress.completed / refreshProgress.total) * 100}%` }}
                />
              </div>
            )}
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
                      disabled={updateCityWeatherMutation.isPending}
                    >
                      {updateCityWeatherMutation.isPending ? 'Güncelleniyor...' : t.weather.updateWeather}
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
