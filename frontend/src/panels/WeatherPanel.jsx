import React, { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

export default function WeatherPanel({ location = "New York" }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchWeather(query) {
    if (!query) return;

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const apiBase = API_BASE;
      const url = `${apiBase}/current.json?q=${encodeURIComponent(query)}`;

      console.debug("Weather fetch url ->", url);

      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Weather API request failed (${res.status}) ${txt}`);
      }

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err?.message || "Error fetching weather");
      console.error("WeatherPanel error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  return (
    <section className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-xl font-semibold">Current Weather</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Powered by WeatherAPI (proxied)
      </p>

      {loading && <p className="text-sm">Loading weather...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && weather && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{weather.location.name}</h3>
            <div className="text-4xl font-bold">{Math.round(weather.current.temp_f)}°F</div>
          </div>

          <p className="text-sm text-muted-foreground">{weather.current.condition.text}</p>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="p-3 bg-sky-50 rounded-md">
              <div className="font-medium">Humidity</div>
              <div>{weather.current.humidity}%</div>
            </div>

            <div className="p-3 bg-sky-50 rounded-md">
              <div className="font-medium">Wind</div>
              <div>{weather.current.wind_mph} mph</div>
            </div>

            <div className="p-3 bg-sky-50 rounded-md">
              <div className="font-medium">Feels Like</div>
              <div>{Math.round(weather.current.feelslike_f)}°F</div>
            </div>

            <div className="p-3 bg-sky-50 rounded-md">
              <div className="font-medium">Pressure</div>
              <div>{weather.current.pressure_in} in</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}