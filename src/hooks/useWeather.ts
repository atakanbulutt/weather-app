import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WeatherService } from '../services/weatherService';
import { WeatherData, ForecastData } from '../types/weather';
import { useLanguage } from '../contexts/LanguageContext';
import { useUnit } from '../contexts/UnitContext';

export const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    'granted' | 'denied' | 'prompt' | 'unknown'
  >('unknown');
  const { language } = useLanguage();
  const { unit } = useUnit();
  const queryClient = useQueryClient();

  // LocalStorage'dan weather data'yı yükle
  useEffect(() => {
    const savedWeather = localStorage.getItem('currentWeather');
    if (savedWeather) {
      try {
        const weatherData = JSON.parse(savedWeather);
        setCurrentWeather(weatherData);
      } catch (error) {
        console.error('Error loading saved weather:', error);
      }
    }
  }, []);

  // Weather data değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (currentWeather) {
      localStorage.setItem('currentWeather', JSON.stringify(currentWeather));
    }
  }, [currentWeather]);

  // Geolocation izin durumunu kontrol et
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setLocationPermission(result.state);

        result.addEventListener('change', () => {
          setLocationPermission(result.state);
        });
      });
    }
  }, []);

  // React Query ile weather data fetching - daha stabil query key
  const weatherQuery = useQuery({
    queryKey: ['weather', currentWeather?.name || 'current', language, unit],
    queryFn: async () => {
      if (!currentWeather?.name) return null;
      return await WeatherService.getCurrentWeather(
        currentWeather.name,
        unit,
        language
      );
    },
    enabled: !!currentWeather?.name,
    staleTime: 10 * 60 * 1000, // 10 dakika
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Mount'ta refetch yapmasın
  });

  // React Query ile forecast data fetching - daha stabil query key
  const forecastQuery = useQuery({
    queryKey: [
      'forecast',
      currentWeather?.coord?.lat || 0,
      currentWeather?.coord?.lon || 0,
      language,
      unit,
    ],
    queryFn: async () => {
      if (!currentWeather?.coord) return null;
      return await WeatherService.getForecast(
        currentWeather.coord.lat,
        currentWeather.coord.lon,
        unit,
        language
      );
    },
    enabled: !!currentWeather?.coord,
    staleTime: 15 * 60 * 1000, // 15 dakika
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Mount'ta refetch yapmasın
  });

  // Mutation for fetching weather by city
  const fetchWeatherByCityMutation = useMutation({
    mutationFn: async (city: string) => {
      const weatherData = await WeatherService.getCurrentWeather(
        city,
        unit,
        language
      );
      return weatherData;
    },
    onSuccess: weatherData => {
      setCurrentWeather(weatherData);
      setError(null);

      // Cache'e weather data'yı kaydet
      queryClient.setQueryData(
        ['weather', weatherData.name, language, unit],
        weatherData
      );

      // Forecast için prefetch yap
      queryClient.prefetchQuery({
        queryKey: [
          'forecast',
          weatherData.coord.lat,
          weatherData.coord.lon,
          language,
          unit,
        ],
        queryFn: () =>
          WeatherService.getForecast(
            weatherData.coord.lat,
            weatherData.coord.lon,
            unit,
            language
          ),
        staleTime: 15 * 60 * 1000,
      });
    },
    onError: (err: Error) => {
      setError(err.message || 'Bir hata oluştu');
    },
  });

  // Mutation for fetching weather by location
  const fetchWeatherByLocationMutation = useMutation({
    mutationFn: async ({ lat, lon }: { lat: number; lon: number }) => {
      const weatherData = await WeatherService.getWeatherByCoords(
        lat,
        lon,
        unit,
        language
      );
      return weatherData;
    },
    onSuccess: weatherData => {
      setCurrentWeather(weatherData);
      setError(null);

      // Cache'e weather data'yı kaydet
      queryClient.setQueryData(
        ['weather', weatherData.name, language, unit],
        weatherData
      );

      // Forecast için prefetch yap
      queryClient.prefetchQuery({
        queryKey: [
          'forecast',
          weatherData.coord.lat,
          weatherData.coord.lon,
          language,
          unit,
        ],
        queryFn: () =>
          WeatherService.getForecast(
            weatherData.coord.lat,
            weatherData.coord.lon,
            unit,
            language
          ),
        staleTime: 15 * 60 * 1000,
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
    localStorage.removeItem('currentWeather');
  }, [queryClient]);

  // Belirli bir şehrin cache'ini temizleme
  const clearCityCache = useCallback(
    (cityName: string) => {
      queryClient.removeQueries({ queryKey: ['weather', cityName] });
      queryClient.removeQueries({ queryKey: ['forecast'] });
    },
    [queryClient]
  );

  // useCallback ile fonksiyonları memoize et - language dependency'si eklendi
  const fetchWeatherByCity = useCallback(
    async (city: string) => {
      fetchWeatherByCityMutation.mutate(city);
    },
    [fetchWeatherByCityMutation]
  );

  const fetchWeatherByLocation = useCallback(
    async (lat: number, lon: number) => {
      fetchWeatherByLocationMutation.mutate({ lat, lon });
    },
    [fetchWeatherByLocationMutation]
  );

  const getUserLocation = useCallback((): Promise<{
    lat: number;
    lon: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            'Bu tarayıcı konum servisini desteklemiyor. Lütfen şehir adı ile arama yapın.'
          )
        );
        return;
      }

      // Mobil için daha uzun timeout
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 saniye
        maximumAge: 300000, // 5 dakika cache
      };

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        error => {
          let errorMessage = 'Konum alınamadı';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin veya şehir adı ile arama yapın.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                'Konum bilgisi mevcut değil. Lütfen şehir adı ile arama yapın.';
              break;
            case error.TIMEOUT:
              errorMessage =
                'Konum alımı zaman aşımına uğradı. Lütfen tekrar deneyin veya şehir adı ile arama yapın.';
              break;
            default:
              errorMessage =
                'Konum alınamadı. Lütfen şehir adı ile arama yapın.';
          }

          reject(new Error(errorMessage));
        },
        options
      );
    });
  }, []);

  // Combined loading state
  const isLoading =
    fetchWeatherByCityMutation.isPending ||
    fetchWeatherByLocationMutation.isPending ||
    weatherQuery.isLoading ||
    forecastQuery.isLoading;

  // Combined error state
  const combinedError =
    error ||
    weatherQuery.error?.message ||
    forecastQuery.error?.message ||
    fetchWeatherByCityMutation.error?.message ||
    fetchWeatherByLocationMutation.error?.message;

  return {
    currentWeather: weatherQuery.data || currentWeather,
    forecast: forecastQuery.data || forecast,
    loading: isLoading,
    error: combinedError,
    locationPermission,
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
