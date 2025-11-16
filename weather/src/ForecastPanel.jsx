import { useEffect, useState } from "react";

export default function ForecastPanel({ apiKey, location }) {
  const [hourly, setHourly] = useState([]);

  useEffect(() => {
    if (!location) return;

    async function fetchForecast() {
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&hours=24`
        );
        const data = await res.json();
        setHourly(data.forecast?.forecastday?.[0]?.hour ?? []);
      } catch (err) {
        console.error("Error fetching forecast:", err);
      }
    }

    fetchForecast();
  }, [location, apiKey]);

  return (
    <div className="p-4 rounded-xl border bg-white shadow">
      <h2 className="text-lg font-semibold mb-3">Hourly Forecast</h2>

      {/* ONLY the hourly items scroll horizontally */}
      <div className="flex gap-4 overflow-x-auto py-2">
        {hourly.map((hour) => (
          <div
            key={hour.time_epoch}
            className="flex flex-col items-center min-w-[80px] bg-gray-100 p-3 rounded-lg shadow-sm"
          >
            {/* Time */}
            <p className="text-xs text-gray-600">
              {new Date(hour.time).toLocaleTimeString([], {
                hour: "numeric",
              })}
            </p>

            {/* Weather icon */}
            <img
              src={hour.condition.icon}
              className="w-10 h-10"
              alt="Weather icon"
            />

            {/* Temp */}
            <p className="text-sm font-semibold">{hour.temp_f}°F</p>
          </div>
        ))}
      </div>
    </div>
  );
}