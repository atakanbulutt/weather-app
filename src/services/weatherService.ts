import { API_KEY, ENDPOINTS, UNITS, LANGUAGES } from '../constants/api';
import { WeatherData, ForecastData } from '../types/weather';

export class WeatherService {
  private static async makeRequest(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error}`);
    }
  }

  static async getCurrentWeather(
    city: string,
    units: string = UNITS.METRIC,
    lang: string = LANGUAGES.TR
  ): Promise<WeatherData> {
    const url = `${ENDPOINTS.CURRENT_WEATHER}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=${lang}`;
    return this.makeRequest(url);
  }

  static async getWeatherByCoords(
    lat: number,
    lon: number,
    units: string = UNITS.METRIC,
    lang: string = LANGUAGES.TR
  ): Promise<WeatherData> {
    const url = `${ENDPOINTS.CURRENT_WEATHER}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}&lang=${lang}`;
    return this.makeRequest(url);
  }

  static async getForecast(
    lat: number,
    lon: number,
    units: string = UNITS.METRIC,
    lang: string = LANGUAGES.TR
  ): Promise<ForecastData> {
    const url = `${ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${API_KEY}&units=${units}&lang=${lang}`;
    return this.makeRequest(url);
  }
}
