import React, { useState, useCallback } from 'react';
import { ForecastData } from '../types/weather';
import { translations } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

interface ForecastProps {
  data: ForecastData;
}

const Forecast: React.FC<ForecastProps> = React.memo(({ data }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(
      language === 'tr' ? 'tr-TR' : 'en-US',
      { weekday: 'short', day: 'numeric', month: 'short' }
    );
  }, [language]);

  const getWeatherIcon = useCallback((iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }, []);

  const getDayName = useCallback((timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(
      language === 'tr' ? 'tr-TR' : 'en-US',
      { weekday: 'long' }
    );
  }, [language]);

  const handleDayClick = useCallback((index: number) => {
    setSelectedDay(selectedDay === index ? null : index);
  }, [selectedDay]);

  // 5 günlük forecast'ı günlük gruplara ayır
  const dailyForecasts = data.list.filter((item, index) => {
    // Her günün 12:00 saatindeki veriyi al (günlük özet için)
    const date = new Date(item.dt * 1000);
    return date.getHours() === 12;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="forecast-container"
    >
      <h3>{t.weather.forecast}</h3>
      
      <div className="forecast-list">
        {dailyForecasts.slice(0, 5).map((day, index) => (
          <motion.div
            key={day.dt}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`forecast-day ${selectedDay === index ? 'selected' : ''}`}
            onClick={() => handleDayClick(index)}
          >
            <div className="day-header">
              <span className="day-name">{getDayName(day.dt)}</span>
              <span className="day-date">{formatDate(day.dt)}</span>
            </div>
            
            <div className="day-weather">
              <img 
                src={getWeatherIcon(day.weather[0].icon)} 
                alt={day.weather[0].description}
                className="weather-icon"
              />
              <div className="day-temp">
                <span className="temp-max">{Math.round(day.main.temp_max)}°</span>
                <span className="temp-min">{Math.round(day.main.temp_min)}°</span>
              </div>
            </div>
            
            <p className="day-description">{day.weather[0].description}</p>
          </motion.div>
        ))}
      </div>

      {selectedDay !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="forecast-details"
        >
          <h4>{getDayName(dailyForecasts[selectedDay].dt)}</h4>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">{t.weather.temperature}</span>
              <span className="detail-value">
                {Math.round(dailyForecasts[selectedDay].main.temp)}°C
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.feelsLike}</span>
              <span className="detail-value">
                {Math.round(dailyForecasts[selectedDay].main.feels_like)}°C
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.humidity}</span>
              <span className="detail-value">
                {dailyForecasts[selectedDay].main.humidity}%
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.windSpeed}</span>
              <span className="detail-value">
                {dailyForecasts[selectedDay].wind.speed} m/s
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.pressure}</span>
              <span className="detail-value">
                {dailyForecasts[selectedDay].main.pressure} hPa
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Yağış Olasılığı</span>
              <span className="detail-value">
                {Math.round(dailyForecasts[selectedDay].pop * 100)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

Forecast.displayName = 'Forecast';

export default Forecast;
