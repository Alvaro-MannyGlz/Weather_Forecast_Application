import React from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  AlertCircle,
} from "lucide-react";
import { useWeather } from "../hooks/useWeather";
import "./panelStyles.css";

/**
 * WeatherPanel - Displays current weather conditions with detailed metrics
 */
export default function WeatherPanel({ location = "Unknown" }) {
  const { weather, loading, error } = useWeather(location);

  if (loading) {
    return (
      <div className="weather-panel">
        <div className="weather-content">
          <div className="loading-spinner">Loading weather data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-panel">
        <div className="weather-content">
          <div className="error-message">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-panel">
        <div className="weather-content">
          <p className="text-slate-500">No data available</p>
        </div>
      </div>
    );
  }

  // Determine weather icon based on condition
  const getWeatherIcon = (condition, isDay) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
      return <CloudRain size={48} className="weather-icon rain" />;
    }
    if (lowerCondition.includes("cloud")) {
      return <Cloud size={48} className="weather-icon cloudy" />;
    }
    if (isDay) {
      return <Sun size={48} className="weather-icon sunny" />;
    }
    return <Cloud size={48} className="weather-icon night" />;
  };

  return (
    <div className="weather-panel">
      {/* Header with temperature */}
      <div className="weather-header">
        <div className="location-info">
          <h2 className="weather-location">
            {weather.city}, {weather.country}
          </h2>
          <p className="weather-sub-text">
            {weather.region} • {weather.timezone}
          </p>
        </div>
        <div className="weather-time">
          <p className="text-sm text-slate-500">
            Last updated: {new Date(weather.last_updated).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Main temperature display */}
      <div className="weather-main">
        <div className="weather-icon-container">
          {getWeatherIcon(weather.description, weather.is_day)}
        </div>
        <div className="temperature-display">
          <div className="temperature-large">{weather.temp_f}°F</div>
          <div className="temperature-small">({weather.temp_c}°C)</div>
          <div className="condition-text">{weather.description}</div>
          <div className="feels-like">
            Feels like {weather.feels_like_f}°F ({weather.feels_like_c}°C)
          </div>
        </div>
      </div>

      {/* Detailed metrics grid */}
      <div className="metrics-grid">
        {/* Humidity */}
        <div className="metric-card">
          <div className="metric-icon">
            <Droplets size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Humidity</p>
            <p className="metric-value">{weather.humidity}%</p>
          </div>
        </div>

        {/* Wind */}
        <div className="metric-card">
          <div className="metric-icon">
            <Wind size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Wind</p>
            <p className="metric-value">
              {weather.wind_speed_mph} mph {weather.wind_direction}
            </p>
            <p className="metric-sub">Gust: {weather.wind_gust_mph} mph</p>
          </div>
        </div>

        {/* Pressure */}
        <div className="metric-card">
          <div className="metric-icon">
            <Gauge size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Pressure</p>
            <p className="metric-value">{weather.pressure_mb} mb</p>
            <p className="metric-sub">{weather.pressure_in} in</p>
          </div>
        </div>

        {/* Visibility */}
        <div className="metric-card">
          <div className="metric-icon">
            <Eye size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Visibility</p>
            <p className="metric-value">{weather.visibility_miles} mi</p>
            <p className="metric-sub">{weather.visibility_km} km</p>
          </div>
        </div>

        {/* UV Index */}
        <div className="metric-card">
          <div className="metric-icon">☀️</div>
          <div className="metric-info">
            <p className="metric-label">UV Index</p>
            <p className="metric-value">{weather.uv_index}</p>
          </div>
        </div>

        {/* Dew Point */}
        <div className="metric-card">
          <div className="metric-icon">💧</div>
          <div className="metric-info">
            <p className="metric-label">Dew Point</p>
            <p className="metric-value">{weather.dew_point_f}°F</p>
          </div>
        </div>
      </div>

      {/* Air quality if available */}
      {weather.air_quality && (
        <div className="air-quality-section">
          <h4>Air Quality</h4>
          <div className="air-quality-info">
            {weather.air_quality.us_epa_index && (
              <p>EPA Index: {weather.air_quality.us_epa_index}</p>
            )}
            {weather.air_quality.pm2_5 && (
              <p>PM2.5: {weather.air_quality.pm2_5.toFixed(1)} µg/m³</p>
            )}
            {weather.air_quality.pm10 && (
              <p>PM10: {weather.air_quality.pm10.toFixed(1)} µg/m³</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
