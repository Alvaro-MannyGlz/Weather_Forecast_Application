import React, { useState, useEffect } from "react";
import { Search, MapPin, Trash2, Save, Cloud, Sun, CloudRain } from "lucide-react";

// --- Inline Components ---

const LocationsPanel = ({ onSelectLocation }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSelectLocation(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-500" />
        Search Location
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter city name (e.g. Austin)"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
};

const ForecastPanel = ({ location }) => {
  // In a real app, you would fetch weather data here based on 'location'
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px] animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{location}</h2>
          <p className="text-slate-500">Current Weather Forecast</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          Live Data
        </div>
      </div>

      {/* Mock Weather Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-slate-100 rounded-lg p-4 text-center bg-slate-50/50 hover:bg-slate-100 transition-colors">
            <p className="text-slate-500 text-sm mb-2">
              {new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', { weekday: 'short' })}
            </p>
            {/* 'weather-icon-float' class comes from App.css */}
            <div className="flex justify-center my-3 weather-icon-float" style={{ animationDelay: `${i * 0.2}s` }}>
              {i % 2 === 0 ? (
                <Sun className="w-8 h-8 text-amber-500" />
              ) : (
                <CloudRain className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <p className="text-xl font-bold text-slate-800">{72 + i * 2}°</p>
            <p className="text-xs text-slate-400">Sunny</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  // State Management
  const [currentLocation, setCurrentLocation] = useState("San Antonio");
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load saved locations from PostgreSQL on app start
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        // Calls your Python backend via the Vite Proxy
        const res = await fetch("/api/saved-locations");
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        // Handle API returning objects [{city: "Paris"}] or strings ["Paris"]
        const cities = data.map((item) => (typeof item === 'object' ? item.city : item));
        setSavedLocations(cities);
      } catch (err) {
        console.log("Backend not connected. Using empty list.");
        setSavedLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // 2. Helper: Add to DB
  const addToDb = async (city) => {
    try {
      await fetch("/api/saved-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
    } catch (err) {
      console.error("Error saving to DB:", err);
    }
  };

  // 3. Helper: Remove from DB
  const removeFromDb = async (city) => {
    try {
      await fetch(`/api/saved-locations/${city}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting from DB:", err);
    }
  };

  // --- Event Handlers ---

  function handleSelectLocation(loc) {
    setCurrentLocation(loc);
    
    if (!savedLocations.includes(loc)) {
      // Update UI immediately (Optimistic UI)
      setSavedLocations((prev) => [loc, ...prev]);
      // Send to Database
      addToDb(loc);
    }
  }

  function handleRemoveSaved(loc) {
    // Update UI immediately
    setSavedLocations((prev) => prev.filter((x) => x !== loc));
    
    // Remove from Database
    removeFromDb(loc);

    // Logic to switch view if we deleted the currently viewed location
    setCurrentLocation((cur) => {
      if (cur === loc) {
        const fallback = savedLocations.find((x) => x !== loc);
        return fallback || "San Antonio";
      }
      return cur;
    });
  }

  function handleClickSaved(loc) {
    setCurrentLocation(loc);
  }

  async function handleClearAll() {
    // Optimistic Clear
    const oldList = [...savedLocations];
    setSavedLocations([]);

    // Delete each from DB
    for (const loc of oldList) {
      await removeFromDb(loc);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cloud className="text-blue-600" />
              Weather App
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Infrastructure Resiliency Tracker — UI
            </p>
          </div>

          <div className="text-xs flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <span className="font-semibold">Status:</span>
            <span className="text-blue-600">Active</span>
          </div>
        </header>

        {/* Top area: two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top-left: Location search & Forecast (Takes up 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <LocationsPanel onSelectLocation={handleSelectLocation} />
            <ForecastPanel location={currentLocation} days={1} />
          </div>

          {/* Top-right: Saved locations list (Takes up 1 column) */}
          <aside className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-fit animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Save className="w-4 h-4 text-slate-500" />
                Saved Locations
              </h2>
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                PostgreSQL
              </div>
            </div>

            {loading ? (
              <div className="text-sm text-slate-400 py-4 text-center">Syncing...</div>
            ) : savedLocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400 mb-2">No locations saved yet.</p>
                <p className="text-xs text-slate-300">Search a city to add it here.</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {savedLocations.map((loc) => (
                  <li
                    key={loc}
                    className={`group flex items-center justify-between p-3 rounded-lg transition-all border ${
                      loc === currentLocation 
                        ? "bg-blue-50 border-blue-200 shadow-sm" 
                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => handleClickSaved(loc)}
                      className="text-left flex-1 flex items-center gap-2"
                    >
                      <MapPin className={`w-4 h-4 ${loc === currentLocation ? 'text-blue-500' : 'text-slate-400'}`} />
                      <div>
                        <div className={`font-medium ${loc === currentLocation ? 'text-blue-700' : 'text-slate-700'}`}>
                          {loc}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSaved(loc);
                      }}
                      aria-label={`Delete ${loc}`}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            {savedLocations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={handleClearAll}
                  className="w-full py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Database
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}