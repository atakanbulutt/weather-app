import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWeather } from '../hooks/useWeather';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import SearchBar from '../components/SearchBar';
import WeatherDisplay from '../components/WeatherDisplay';
import Forecast from '../components/Forecast';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const {
    currentWeather,
    forecast,
    loading,
    error,
    locationPermission,
    fetchWeatherByCity,
    fetchWeatherByLocation,
    getUserLocation,
  } = useWeather();

  const { language } = useLanguage();
  const t = translations[language];
  const hasInitialized = useRef(false);

  useEffect(() => {
    const getInitialLocation = async () => {
      // Sadece bir kez çalışsın ve localStorage'da veri yoksa
      if (hasInitialized.current || currentWeather) {
        return;
      }

      // LocalStorage'da kayıtlı weather data var mı kontrol et
      const savedWeather = localStorage.getItem('currentWeather');
      if (savedWeather) {
        try {
          // Eğer localStorage'da veri varsa, sadece forecast için istek at
          console.log('Using cached weather data from localStorage');
          return;
        } catch (error) {
          console.error('Error parsing saved weather:', error);
        }
      }

      // Mobil cihazlarda konum izni kontrolü
      if (locationPermission === 'denied') {
        console.log(
          'Location permission denied, skipping automatic location fetch'
        );
        return;
      }

      try {
        hasInitialized.current = true;
        console.log('Fetching initial location weather...');
        const coords = await getUserLocation();
        await fetchWeatherByLocation(coords.lat, coords.lon);
      } catch (err) {
        console.error('Initial location error:', err);
        hasInitialized.current = false; // Hata durumunda tekrar deneyebilsin
      }
    };

    getInitialLocation();
  }, [
    currentWeather,
    fetchWeatherByLocation,
    getUserLocation,
    locationPermission,
  ]); // ESLint için dependencies eklendi

  const handleSearch = async (city: string) => {
    await fetchWeatherByCity(city);
  };

  const handleLocationSearch = async () => {
    try {
      const coords = await getUserLocation();
      await fetchWeatherByLocation(coords.lat, coords.lon);
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  // Konum izni reddedildiğinde gösterilecek mesaj
  const renderLocationPermissionMessage = () => {
    if (locationPermission === 'denied') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="location-permission-message"
        >
          <p>
            📍 Konum izni reddedildi. Hava durumu bilgisi için şehir adı ile
            arama yapabilirsiniz.
          </p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="home-page">
      <header className="app-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.app.title}
        </motion.h1>
        <nav className="nav-links">
          <Link to="/dashboard" className="nav-link">
            {t.dashboard.title}
          </Link>
          <Link to="/settings" className="nav-link">
            ⚙️
          </Link>
        </nav>
      </header>

      <main className="main-content">
        <SearchBar
          onSearch={handleSearch}
          onLocationSearch={handleLocationSearch}
        />

        {renderLocationPermissionMessage()}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loading"
          >
            {t.app.loading}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error"
          >
            {error}
          </motion.div>
        )}

        {currentWeather && <WeatherDisplay data={currentWeather} />}

        {forecast && <Forecast data={forecast} />}
      </main>
    </div>
  );
};

export default HomePage;
