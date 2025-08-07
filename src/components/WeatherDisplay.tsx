import React, { useState, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { translations } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

interface WeatherDisplayProps {
  data: WeatherData;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data }) => {
  const { language } = useLanguage();
  const t = translations[language];

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="weather-display"
    >
      <div className="weather-header">
        <h2>{data.name}, {data.sys.country}</h2>
        <div className="weather-main">
          <img 
            src={getWeatherIcon(data.weather[0].icon)} 
            alt={data.weather[0].description}
            className="weather-icon"
          />
          <div className="temperature">
            <span className="temp-value">{Math.round(data.main.temp)}°C</span>
            <span className="temp-feels-like">
              {t.weather.feelsLike}: {Math.round(data.main.feels_like)}°C
            </span>
          </div>
        </div>
        <p className="weather-description">{data.weather[0].description}</p>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">{t.weather.humidity}</span>
          <span className="detail-value">{data.main.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t.weather.windSpeed}</span>
          <span className="detail-value">{data.wind.speed} m/s</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t.weather.pressure}</span>
          <span className="detail-value">{data.main.pressure} hPa</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t.weather.visibility}</span>
          <span className="detail-value">{data.visibility / 1000} km</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t.weather.sunrise}</span>
          <span className="detail-value">{formatTime(data.sys.sunrise)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t.weather.sunset}</span>
          <span className="detail-value">{formatTime(data.sys.sunset)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherDisplay;

