import { useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Custom hook for fetching real-time weather data
 * @param {string} city - City name to fetch weather for
 * @returns {Object} - { weather, loading, error }
 */
export function useWeather(city) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || city.trim() === "") {
      setWeather(null);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/weather/${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch weather");
        }

        setWeather(data);
      } catch (err) {
        setError(err.message);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchWeather();

    // Optionally refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  return { weather, loading, error };
}

/**
 * Custom hook for fetching forecast data
 * @param {string} city - City name to fetch forecast for
 * @returns {Object} - { forecast, loading, error }
 */
export function useForecast(city) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || city.trim() === "") {
      setForecast(null);
      return;
    }

    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/forecast/${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch forecast");
        }

        setForecast(data);
      } catch (err) {
        setError(err.message);
        setForecast(null);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchForecast();

    // Optionally refresh every 30 minutes
    const interval = setInterval(fetchForecast, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  return { forecast, loading, error };
}

/**
 * Custom hook for fetching weather history
 * @param {string} city - City name
 * @param {number} hours - Number of hours to look back (default 24)
 * @returns {Object} - { history, loading, error }
 */
export function useWeatherHistory(city, hours = 24) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || city.trim() === "") {
      setHistory(null);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/weather-history/${encodeURIComponent(city)}?hours=${hours}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch history");
        }

        setHistory(data.records);
      } catch (err) {
        setError(err.message);
        setHistory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Refresh every 5 minutes
    const interval = setInterval(fetchHistory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city, hours]);

  return { history, loading, error };
}

/**
 * Custom hook for managing saved locations
 * @returns {Object} - { locations, loading, addLocation, removeLocation }
 */
export function useSavedLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch saved locations
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/saved-locations`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch locations");
        }

        setLocations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const addLocation = async (city) => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });

      const data = await response.json();

      if (!response.ok && response.status !== 409) {
        throw new Error(data.error || "Failed to save location");
      }

      // If it's a conflict or new, update the list
      if (response.status === 201 || response.status === 409) {
        setLocations((prev) => {
          const exists = prev.some((loc) => loc.city === city);
          return exists ? prev : [data, ...prev];
        });
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeLocation = async (locationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-locations/${locationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete location");
      }

      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { locations, loading, error, addLocation, removeLocation };
}
