import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WeatherService } from '../services/weatherService';
import { WeatherData, ForecastData } from '../types/weather';
import { useLanguage } from '../contexts/LanguageContext';

export const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // React Query ile weather data fetching
  const weatherQuery = useQuery({
    queryKey: ['weather', currentWeather?.name, language],
    queryFn: async () => {
      if (!currentWeather?.name) return null;
      return await WeatherService.getCurrentWeather(currentWeather.name, 'metric', language);
    },
    enabled: !!currentWeather?.name,
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 2,
  });

  // React Query ile forecast data fetching
  const forecastQuery = useQuery({
    queryKey: ['forecast', currentWeather?.coord?.lat, currentWeather?.coord?.lon, language],
    queryFn: async () => {
      if (!currentWeather?.coord) return null;
      return await WeatherService.getForecast(
        currentWeather.coord.lat,
        currentWeather.coord.lon,
        'metric',
        language
      );
    },
    enabled: !!currentWeather?.coord,
    staleTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
  });

  // Mutation for fetching weather by city
  const fetchWeatherByCityMutation = useMutation({
    mutationFn: async (city: string) => {
      const weatherData = await WeatherService.getCurrentWeather(city, 'metric', language);
      return weatherData;
    },
    onSuccess: (weatherData) => {
      setCurrentWeather(weatherData);
      setError(null);
      
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
        staleTime: 10 * 60 * 1000,
      });
    },
    onError: (err: Error) => {
      setError(err.message || 'Bir hata oluştu');
    },
  });

  // Mutation for fetching weather by location
  const fetchWeatherByLocationMutation = useMutation({
    mutationFn: async ({ lat, lon }: { lat: number; lon: number }) => {
      const weatherData = await WeatherService.getWeatherByCoords(lat, lon, 'metric', language);
      return weatherData;
    },
    onSuccess: (weatherData) => {
      setCurrentWeather(weatherData);
      setError(null);
      
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
        staleTime: 10 * 60 * 1000,
      });
    },
    onError: (err: Error) => {
      setError(err.message || 'Bir hata oluştu');
    },
  });

  // Cache temizleme fonksiyonu
  const clearCache = useCallback(() => {
    queryClient.clear();
    setCurrentWeather(null);
    setForecast(null);
    setError(null);
  }, [queryClient]);

  // Belirli bir şehrin cache'ini temizleme
  const clearCityCache = useCallback((cityName: string) => {
    queryClient.removeQueries({ queryKey: ['weather', cityName] });
    queryClient.removeQueries({ queryKey: ['forecast'] });
  }, [queryClient]);

  // useCallback ile fonksiyonları memoize et
  const fetchWeatherByCity = useCallback(async (city: string) => {
    fetchWeatherByCityMutation.mutate(city);
  }, [fetchWeatherByCityMutation]);

  const fetchWeatherByLocation = useCallback(async (lat: number, lon: number) => {
    fetchWeatherByLocationMutation.mutate({ lat, lon });
  }, [fetchWeatherByLocationMutation]);

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

  // Combined loading state
  const isLoading = fetchWeatherByCityMutation.isPending || 
                   fetchWeatherByLocationMutation.isPending || 
                   weatherQuery.isLoading || 
                   forecastQuery.isLoading;

  // Combined error state
  const combinedError = error || 
                       weatherQuery.error?.message || 
                       forecastQuery.error?.message ||
                       fetchWeatherByCityMutation.error?.message ||
                       fetchWeatherByLocationMutation.error?.message;

  return {
    currentWeather: weatherQuery.data || currentWeather,
    forecast: forecastQuery.data || forecast,
    loading: isLoading,
    error: combinedError,
    fetchWeatherByCity,
    fetchWeatherByLocation,
    getUserLocation,
    // React Query specific states
    isRefetching: weatherQuery.isRefetching || forecastQuery.isRefetching,
    isError: weatherQuery.isError || forecastQuery.isError,
    refetch: () => {
      weatherQuery.refetch();
      forecastQuery.refetch();
    },
    // Cache management functions
    clearCache,
    clearCityCache,
    // Query client for advanced usage
    queryClient,
  };
};
