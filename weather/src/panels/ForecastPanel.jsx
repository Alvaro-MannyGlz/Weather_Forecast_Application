import React, { useEffect, useState } from "react";
import { API_BASE, API_KEY } from "../lib/api.ts";

export default function ForecastPanel({ location = "New York", days = 3 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) return;
    fetchForecast(location, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, days]);

  async function fetchForecast(loc, d) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const url = `${API_BASE}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
        loc
      )}&days=${d}&aqi=no&alerts=no`;

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Forecast fetch failed (${res.status}) ${text}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to fetch forecast");
    } finally {
      setLoading(false);
    }
  }

  // helpers
  const fmtHour = (raw) => {
    try {
      const dt = new Date(raw);
      return dt.toLocaleTimeString([], { hour: "numeric", minute: undefined });
    } catch {
      return raw;
    }
  };
  const fmtDate = (raw) => {
    try {
      const dt = new Date(raw);
      return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    } catch {
      return raw;
    }
  };

  return (
    <section className="bg-white rounded-xl p-5 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">Forecast — {location}</h3>
          <div className="text-xs text-muted-foreground">
            {data?.location?.localtime ? `Local: ${data.location.localtime}` : loading ? "Loading…" : ""}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {loading ? "Refreshing..." : error ? "Error" : `${days}-day`}
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      {/* Hourly strip: show hours for the first forecast day */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Hourly (first day)</h4>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {loading && !data
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[88px] h-20 bg-slate-100 animate-pulse rounded-lg" />
              ))
            : (data?.forecast?.forecastday?.[0]?.hour || []).map((h, i) => (
                <div
                  key={i}
                  className="min-w-[88px] flex-shrink-0 bg-slate-50 rounded-lg p-2 text-center"
                >
                  <div className="text-xs text-muted-foreground">{fmtHour(h.time)}</div>
                  <img
                    src={h.condition.icon}
                    alt={h.condition.text}
                    className="mx-auto my-1 w-8 h-8"
                    decoding="async"
                  />
                  <div className="text-lg font-semibold">{Math.round(h.temp_f)}°</div>
                  <div className="text-xs text-muted-foreground">{h.wind_mph} mph</div>
                </div>
              ))}
        </div>
      </div>

      {/* Daily */}
      <div className="mt-5">
        <h4 className="text-sm font-medium mb-2">Daily</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          {loading && !data
            ? Array.from({ length: days }).map((_, i) => (
                <div key={i} className="p-3 bg-slate-100 animate-pulse rounded-lg h-24" />
              ))
            : (data?.forecast?.forecastday || []).map((day, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <div className="flex-shrink-0 text-center w-20">
                    <div className="text-xs text-muted-foreground">{fmtDate(day.date)}</div>
                    <img
                      src={day.day.condition.icon}
                      alt={day.day.condition.text}
                      className="mx-auto mt-1 w-10 h-10"
                      decoding="async"
                    />
                    <div className="text-xs text-muted-foreground">{day.day.condition.text}</div>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      High {Math.round(day.day.maxtemp_f)}° • Low {Math.round(day.day.mintemp_f)}°
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Precip: {Math.round(day.day.daily_chance_of_rain || day.day.daily_chance_of_snow || 0)}% • Avg wind {Math.round(day.day.maxwind_mph)} mph
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}