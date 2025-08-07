import { useState, useCallback } from 'react';
import { WeatherService } from '../services/weatherService';
import { WeatherData, ForecastData } from '../types/weather';
import { useLanguage } from '../contexts/LanguageContext';

export const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // useCallback ile fonksiyonları memoize et
  const fetchWeatherByCity = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const weatherData = await WeatherService.getCurrentWeather(city, 'metric', language);
      setCurrentWeather(weatherData);
      
      const forecastData = await WeatherService.getForecast(
        weatherData.coord.lat,
        weatherData.coord.lon,
        'metric',
        language
      );
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [language]);

  const fetchWeatherByLocation = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const weatherData = await WeatherService.getWeatherByCoords(lat, lon, 'metric', language);
      setCurrentWeather(weatherData);
      
      const forecastData = await WeatherService.getForecast(lat, lon, 'metric', language);
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [language]);

  const getUserLocation = useCallback((): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation desteklenmiyor'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error('Konum alınamadı'));
        }
      );
    });
  }, []);

  return {
    currentWeather,
    forecast,
    loading,
    error,
    fetchWeatherByCity,
    fetchWeatherByLocation,
    getUserLocation,
  };
};
