import React, { useState } from 'react';
import { ForecastData } from '../types/weather';
import { translations } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

interface ForecastProps {
  data: ForecastData;
}

const Forecast: React.FC<ForecastProps> = ({ data }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(
      language === 'tr' ? 'tr-TR' : 'en-US',
      { weekday: 'short', day: 'numeric', month: 'short' }
    );
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getDayName = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(
      language === 'tr' ? 'tr-TR' : 'en-US',
      { weekday: 'long' }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="forecast-container"
    >
      <h3>{t.weather.forecast}</h3>
      
      <div className="forecast-list">
        {data.daily.slice(0, 7).map((day, index) => (
          <motion.div
            key={day.dt}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`forecast-day ${selectedDay === index ? 'selected' : ''}`}
            onClick={() => setSelectedDay(selectedDay === index ? null : index)}
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
                <span className="temp-max">{Math.round(day.temp.max)}°</span>
                <span className="temp-min">{Math.round(day.temp.min)}°</span>
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
          <h4>{getDayName(data.daily[selectedDay].dt)}</h4>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">{t.weather.temperature}</span>
              <span className="detail-value">
                {Math.round(data.daily[selectedDay].temp.day)}°C
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.feelsLike}</span>
              <span className="detail-value">
                {Math.round(data.daily[selectedDay].feels_like.day)}°C
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.humidity}</span>
              <span className="detail-value">
                {data.daily[selectedDay].humidity}%
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.windSpeed}</span>
              <span className="detail-value">
                {data.daily[selectedDay].wind_speed} m/s
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t.weather.pressure}</span>
              <span className="detail-value">
                {data.daily[selectedDay].pressure} hPa
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">UV Index</span>
              <span className="detail-value">
                {data.daily[selectedDay].uvi}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Forecast;
