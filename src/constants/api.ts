export const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const API_KEY = '48f4c2b6107b0b0441bf2c16a838498b';


export const ENDPOINTS = {
  CURRENT_WEATHER: `${API_BASE_URL}/weather`,
  FORECAST: `${API_BASE_URL}/onecall`,
} as const;

export const UNITS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
} as const;

export const LANGUAGES = {
  TR: 'tr',
  EN: 'en',
} as const;
