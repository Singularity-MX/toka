
import { useEffect, useState } from "react";

const INITIAL_STATE = {
  location: "Obteniendo ubicación...",
  temperature: "-- °C",
  condition: "",
  weatherCode: null,
  loading: true,
  error: null,
};

const WEATHER_CODES = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos intensos",
  95: "Tormenta eléctrica",
  96: "Tormenta con granizo",
  99: "Tormenta intensa con granizo",
};

export default function useWeatherLocation() {
  const [weather, setWeather] = useState(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    const updateWeather = async (latitude, longitude) => {
      try {
        // 1. Obtener el nombre de la ciudad
        const locationResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
        );

        if (!locationResponse.ok) {
          throw new Error("No se pudo obtener la ciudad.");
        }

        const locationData = await locationResponse.json();

        const city =
          locationData.city ||
          locationData.locality ||
          locationData.principalSubdivision ||
          "Ubicación desconocida";

        const state = locationData.principalSubdivision;

        const locationName =
          state && state !== city
            ? `${city}, ${state}`
            : city;

        // 2. Obtener el clima actual
        const weatherUrl =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}` +
          `&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m` +
          `&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
          throw new Error("No se pudo obtener el clima.");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        if (!cancelled) {
          setWeather({
            location: locationName,
            temperature: `${Math.round(current.temperature_2m)} °C`,
            condition:
              WEATHER_CODES[current.weather_code] || "Condición desconocida",
            weatherCode: current.weather_code,
            humidity: current.relative_humidity_2m,
            apparentTemperature: current.apparent_temperature,
            windSpeed: current.wind_speed_10m,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setWeather((previous) => ({
            ...previous,
            loading: false,
            error: error.message,
          }));
        }
      }
    };

    // 3. Obtener la ubicación del usuario
    if (!navigator.geolocation) {
      setWeather((previous) => ({
        ...previous,
        loading: false,
        error: "Tu navegador no soporta geolocalización.",
        location: "Ubicación no disponible",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        updateWeather(latitude, longitude);
      },
      (error) => {
        if (!cancelled) {
          setWeather((previous) => ({
            ...previous,
            location: "Ubicación no disponible",
            loading: false,
            error:
              error.code === error.PERMISSION_DENIED
                ? "Permiso de ubicación denegado."
                : "No se pudo obtener tu ubicación.",
          }));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return weather;
}
