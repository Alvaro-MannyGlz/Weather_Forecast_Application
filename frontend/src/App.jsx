import React, { useState, useEffect } from "react";
import { Cloud } from "lucide-react";
import LocationsPanel from "./panels/LocationsPanel";
import ForecastPanel from "./panels/ForecastPanel";
import TodoPanel from "./panels/ToDoPanel";
import "./App.css";   // ← add this

export default function App() {
  const [currentLocation, setCurrentLocation] = useState("San Antonio");
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load saved locations (placeholder — replace with API if needed)
  useEffect(() => {
    setSavedLocations(["Austin", "Dallas", "Houston"]);
  }, []);

  function handleSelectLocation(loc) {
    setCurrentLocation(loc);

    if (!savedLocations.includes(loc)) {
      setSavedLocations([loc, ...savedLocations]);
    }
  }

  function handleClickSaved(loc) {
    setCurrentLocation(loc);
  }

  function handleRemoveSaved(loc) {
    setSavedLocations(savedLocations.filter((x) => x !== loc));
  }

  return (
    <div className="app-root">

      <div className="dashboard-grid">

        {/* TITLE – Full width top row */}
        <div className="card full-width title-card">
          <h1 className="app-title">
            <Cloud size={28} /> WeatherOrNot
          </h1>
          <p className="subtitle">Infrastructure Resiliency Tracker</p>

          <div className="title-search-area">
            <LocationsPanel onSelectLocation={handleSelectLocation} />
          </div>
        </div>

        {/* MIDDLE LEFT – Saved Locations */}
        <div className="card">
          <LocationsPanel
            savedLocations={savedLocations}
            currentLocation={currentLocation}
            loading={loading}
            onClickSaved={handleClickSaved}
            onRemoveSaved={handleRemoveSaved}
          />
        </div>

        {/* MIDDLE RIGHT – TODO PANEL (moved here) */}
        <div className="card">
          <TodoPanel defaultLocation={currentLocation} />
        </div>

        {/* BOTTOM – Forecast full width (swapped with Todo) */}
        <div className="card full-width">
          <ForecastPanel location={currentLocation} />
        </div>

      </div>
    </div>
  );
}