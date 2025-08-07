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
    fetchWeatherByCity, 
    fetchWeatherByLocation, 
    getUserLocation 
  } = useWeather();
  
  const { language } = useLanguage();
  const t = translations[language];
  const hasInitialized = useRef(false);

  useEffect(() => {
    const getInitialLocation = async () => {
      // Sadece bir kez çalışsın
      if (hasInitialized.current || currentWeather) {
        return;
      }

      try {
        hasInitialized.current = true;
        const coords = await getUserLocation();
        await fetchWeatherByLocation(coords.lat, coords.lon);
      } catch (err) {
        console.error('Initial location error:', err);
        hasInitialized.current = false; // Hata durumunda tekrar deneyebilsin
      }
    };

    getInitialLocation();
  }, []);

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
        <SearchBar onSearch={handleSearch} onLocationSearch={handleLocationSearch} />
        
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
        
        {currentWeather && (
          <WeatherDisplay data={currentWeather} />
        )}
        
        {forecast && (
          <Forecast data={forecast} />
        )}
      </main>
    </div>
  );
};

export default HomePage;
