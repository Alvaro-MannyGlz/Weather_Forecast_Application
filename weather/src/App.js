import React, { useState, useEffect } from "react";
import { API_BASE } from "./lib/api.ts";

import LocationsPanel from "./panels/LocationPanel";
import ForecastPanel from "./panels/ForecastPanel";

export default function App() {
  // currently selected location used for fetching forecast
  const [currentLocation, setCurrentLocation] = useState("San Antonio");
  // simple saved locations list stored in state (persist how you like)
  const [savedLocations, setSavedLocations] = useState([
    "San Antonio",
    "New York",
    "Chicago",
  ]);

  // Add selected location to saved list if not present
  function handleSelectLocation(loc) {
    setCurrentLocation(loc);
    setSavedLocations((s) => {
      if (s.includes(loc)) return s;
      return [loc, ...s];
    });
  }

  function handleRemoveSaved(loc) {
    setSavedLocations((s) => s.filter((x) => x !== loc));
    // if we removed the currently viewed location, fall back to first saved or default
    setCurrentLocation((cur) => {
      if (cur === loc) return savedLocations.find((x) => x !== loc);
      return cur;
    });
  }

  function handleClickSaved(loc) {
    setCurrentLocation(loc);
  }

  // optional: persist savedLocations to localStorage so they survive reloads
  useEffect(() => {
    const raw = window.localStorage.getItem("savedLocations");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setSavedLocations(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    } catch {}
  }, [savedLocations]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weather App</h1>
          <p className="text-sm text-muted-foreground">
            Infrastructure Resiliency Tracker — UI
          </p>
        </div>

        <div className="text-xs flex items-center gap-2 text-muted-foreground">
          <span>API:</span>
          <code className="rounded bg-muted px-2 py-1">{API_BASE}</code>
        </div>
      </header>

      {/* Top area: two columns (left search box, right saved list) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top-left: Location search box / input */}
        <div>
          <LocationsPanel onSelectLocation={handleSelectLocation} />
        </div>

        {/* Top-right: Saved locations list */}
        <aside className="bg-white rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Saved Locations</h2>
            <div className="text-xs text-muted-foreground">Tap to view</div>
          </div>

          {savedLocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved locations yet.</p>
          ) : (
            <ul className="space-y-2">
              {savedLocations.map((loc) => (
                <li
                  key={loc}
                  className={`flex items-center justify-between p-2 rounded-md hover:bg-slate-50 ${
                    loc === currentLocation ? "bg-slate-100" : ""
                  }`}
                >
                  <button
                    onClick={() => handleClickSaved(loc)}
                    className="text-left flex-1"
                  >
                    <div className="font-medium">{loc}</div>
                    <div className="text-xs text-muted-foreground">click to load</div>
                  </button>

                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => handleRemoveSaved(loc)}
                      aria-label={`Delete ${loc}`}
                      className="text-xs px-2 py-1 rounded border hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* small actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                // quick add current to saved if missing
                if (!savedLocations.includes(currentLocation)) {
                  setSavedLocations((s) => [currentLocation, ...s]);
                }
              }}
              className="px-3 py-1 rounded bg-sky-600 text-white text-sm"
            >
              Save current
            </button>

            <button
              onClick={() => {
                setSavedLocations([]);
              }}
              className="px-3 py-1 rounded border text-sm"
            >
              Clear
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom area: Hourly forecast (full width) */}
      <div>
        <ForecastPanel location={currentLocation} days={1} />
      </div>

      <footer className="pt-8 text-center text-xs text-muted-foreground">
        Built with React, Tailwind, and WeatherAPI.
      </footer>
    </div>
  );
}