import axios from 'axios';
import type { Weather } from '@/types';

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
  };
  hourly: {
    pressure_msl: number[];
  };
}

const weatherCodes: Record<number, string> = {
  0: 'Klar',
  1: 'Klar', 2: 'Leicht bewölkt', 3: 'Bewölkt',
  45: 'Nebel', 48: 'Nebel',
  51: 'Nieselregen', 53: 'Nieselregen', 55: 'Nieselregen',
  61: 'Regen', 63: 'Regen', 65: 'Regen',
  71: 'Schnee', 73: 'Schnee', 75: 'Schnee',
  80: 'Regenschauer', 81: 'Regenschauer', 82: 'Regenschauer',
  95: 'Gewitter', 96: 'Gewitter', 99: 'Gewitter',
};

export async function fetchWeather(lat: number, lng: number, timestamp?: string): Promise<Weather> {
  let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=pressure_msl`;
  
  if (timestamp) {
    // Historical data
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().split('T')[0];
    url = url.replace('forecast', `archive?start_date=${formattedDate}&end_date=${formattedDate}`);
  }
  
  const response = await axios.get<OpenMeteoResponse>(url);
  const data = response.data;
  
  return {
    temp: data.current_weather.temperature,
    pressure: data.hourly.pressure_msl[0] || 1013,
    windSpeed: data.current_weather.windspeed,
    windDirection: data.current_weather.winddirection,
    conditions: weatherCodes[data.current_weather.weathercode] || 'Unbekannt',
  };
}

export function getWeatherRecommendation(weather: Weather): string {
  const recommendations: string[] = [];
  
  if (weather.pressure < 1000) {
    recommendations.push('Tiefdruck - Fische sind aktiv');
  } else if (weather.pressure > 1025) {
    recommendations.push('Hochdruck - Fische sind träge');
  }
  
  if (weather.windSpeed > 15) {
    recommendations.push('Starker Wind - Seek Schutz');
  } else if (weather.windSpeed < 5) {
    recommendations.push('Windstill - Perfekte Bedingungen');
  }
  
  if (weather.conditions.includes('Regen')) {
    recommendations.push('Regen - Sauerstoffeintrag, gute Bissaktivität');
  }
  
  return recommendations.join(' | ') || 'Standardbedingungen';
}

// Berechne Sonnenposition (vereinfachte Näherung für Deutschland)
export function getSunPosition(lat: number, lng: number, date: Date): {
  hoursFromSunrise: number;
  hoursFromSunset: number;
  phase: 'night' | 'dawn' | 'day' | 'dusk' | 'night';
} {
  const hour = date.getHours() + date.getMinutes() / 60;
  const month = date.getMonth() + 1;
  
  // Vereinfachte Sonnenzeiten für Deutschland (ca. 50°N)
  // Sommer: Sonnenaufgang ~5:00, Sonnenuntergang ~21:00
  // Winter: Sonnenaufgang ~8:00, Sonnenuntergang ~16:30
  
  let sunriseHour: number;
  let sunsetHour: number;
  
  if (month >= 4 && month <= 8) {
    // Frühling/Sommer
    sunriseHour = 5 + (month - 4) * 0.5; // 5:00 - 7:00
    sunsetHour = 21 - (month - 4) * 0.5; // 21:00 - 19:00
  } else if (month >= 9 && month <= 10) {
    // Herbst
    sunriseHour = 7 + (month - 8) * 0.3;
    sunsetHour = 19 - (month - 8) * 0.8;
  } else {
    // Winter
    sunriseHour = 8;
    sunsetHour = 16.5;
  }
  
  // Dämmerung: 30 Minuten vor/nach
  const dawnStart = sunriseHour - 0.5;
  const duskEnd = sunsetHour + 0.5;
  
  let phase: 'night' | 'dawn' | 'day' | 'dusk' | 'night';
  
  if (hour < dawnStart) {
    phase = 'night';
  } else if (hour < sunriseHour) {
    phase = 'dawn';
  } else if (hour < sunsetHour) {
    phase = 'day';
  } else if (hour < duskEnd) {
    phase = 'dusk';
  } else {
    phase = 'night';
  }
  
  return {
    hoursFromSunrise: hour - sunriseHour,
    hoursFromSunset: hour - sunsetHour,
    phase,
  };
}
