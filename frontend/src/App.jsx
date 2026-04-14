import React, { useEffect, useMemo, useState } from "react";
import { Cloud, Moon, SunMedium, Trash2 } from "lucide-react";
import LocationsPanel from "./panels/LocationsPanel";
import WeatherPanel from "./panels/WeatherPanel";
import ForecastPanel from "./panels/ForecastPanel";
import TodoPanel from "./panels/ToDoPanel";
import { useSavedLocations } from "./hooks/useWeather";
import "./App.css";

const POPULAR_CITIES = [
  "Austin",
  "San Antonio",
  "Dallas",
  "Houston",
  "Chicago",
  "New York",
  "Los Angeles",
  "Miami",
  "Seattle",
  "Denver",
  "Phoenix",
  "Atlanta",
  "Boston",
  "Portland",
  "San Diego",
  "Las Vegas",
  "Nashville",
  "Philadelphia",
  "London",
  "Paris",
  "Tokyo",
  "Toronto",
  "Sydney",
  "Mexico City",
  "Dubai",
  "Singapore",
];

export default function App() {
  const [currentLocation, setCurrentLocation] = useState("San Antonio");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.localStorage.getItem("weatherornot-theme") || "dark";
  });
  const { locations, addLocation, removeLocation, loading: locationsLoading } = useSavedLocations();

  const citySuggestions = useMemo(() => {
    const suggestionSet = new Set(POPULAR_CITIES);

    locations.forEach((location) => {
      if (location.city) {
        suggestionSet.add(location.city);
      }
    });

    return Array.from(suggestionSet).sort((left, right) => left.localeCompare(right));
  }, [locations]);

  useEffect(() => {
    window.localStorage.setItem("weatherornot-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Handle selecting a saved location
  function handleSelectSavedLocation(city) {
    setCurrentLocation(city);
  }

  // Handle removing a saved location
  async function handleRemoveSavedLocation(id) {
    try {
      await removeLocation(id);
    } catch (err) {
      console.error("Failed to remove location:", err);
    }
  }

  // Handle searching for a new location
  async function handleSearchLocation(city) {
    if (!city || city.trim() === "") return;

    setCurrentLocation(city);

    try {
      await addLocation(city);
    } catch (err) {
      console.error("Failed to add location:", err);
    }
  }

  return (
    <div className={`app-root ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <div className="dashboard-grid">
        {/* HEADER - Full width */}
        <div className="card full-width title-card">
          <div className="header-content">
            <div>
              <h1 className="app-title">
                <Cloud size={32} /> WeatherOrNot
              </h1>
              <p className="subtitle">Real-time Weather & Infrastructure Tracking</p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <SunMedium size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <span className="current-location-badge">
                📍 {currentLocation}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH PANEL - Full width */}
        <div className="card full-width">
          <LocationsPanel
            onSelectLocation={handleSearchLocation}
            suggestions={citySuggestions}
          />
        </div>

        {/* CURRENT WEATHER - Full width */}
        <div className="card full-width">
          <WeatherPanel location={currentLocation} />
        </div>

        <div className="full-width workbench-layout">
          <div className="card checklist-workspace">
            <TodoPanel defaultLocation={currentLocation} />
          </div>

          <div className="workbench-sidebar">
            <div className="card forecast-shell">
              <ForecastPanel location={currentLocation} />
            </div>

            <div className="card saved-locations-panel">
              <div className="panel-header">
                <h3>Saved Locations</h3>
                <span className="location-count">
                  📍 {locations.length}
                </span>
              </div>

              {locationsLoading ? (
                <div className="loading-placeholder">Loading locations...</div>
              ) : locations.length === 0 ? (
                <div className="empty-placeholder">
                  No saved locations yet. Search for a city above!
                </div>
              ) : (
                <div className="locations-list">
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      className={`location-item ${
                        currentLocation === loc.city ? "active" : ""
                      }`}
                    >
                      <button
                        className="location-name"
                        onClick={() => handleSelectSavedLocation(loc.city)}
                      >
                        📍 {loc.city}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveSavedLocation(loc.id)}
                        title="Remove location"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}