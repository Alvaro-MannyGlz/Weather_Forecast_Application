import React, { useState, useEffect } from "react";
import { Cloud, LayoutGrid, Save, MapPin, ArrowRight, Trash2 } from "lucide-react";
import './App.css';

// 2. Import your Components
import LocationsPanel from "./panels/LocationsPanel";
import ForecastPanel from "./panels/ForecastPanel";

export default function App() {
  // State Management
  const [currentLocation, setCurrentLocation] = useState("Austin");
  const [savedLocations, setSavedLocations] = useState([]);
  
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Load Saved Locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setDbLoading(true);
        const res = await fetch("/api/saved-locations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const cities = data.map((item) => (typeof item === 'object' ? item.city : item));
        setSavedLocations(cities);
      } catch (err) {
        console.log("Backend not connected yet.");
      } finally {
        setDbLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Load Weather
  useEffect(() => {
    if (!currentLocation) return;

    const fetchWeather = async () => {
        setWeatherLoading(true);
        setWeatherError(null);
        try {
            const res = await fetch(`/api/weather/${currentLocation}`);
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch weather");
            }
            setWeatherData(data);
        } catch (err) {
            setWeatherError(err.message);
            setWeatherData(null);
        } finally {
            setWeatherLoading(false);
        }
    };

    fetchWeather();
  }, [currentLocation]);

  // Helpers
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

  const removeFromDb = async (city) => {
    try {
      await fetch(`/api/saved-locations/${city}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting from DB:", err);
    }
  };

  function handleSelectLocation(loc) {
    setCurrentLocation(loc);
    if (!savedLocations.includes(loc)) {
      setSavedLocations((prev) => [loc, ...prev]);
      addToDb(loc);
    }
  }

  function handleRemoveSaved(loc) {
    setSavedLocations((prev) => prev.filter((x) => x !== loc));
    removeFromDb(loc);
    
    if (currentLocation === loc) {
        setCurrentLocation(""); 
        setWeatherData(null);
    }
  }

  async function handleClearAll() {
    const oldList = [...savedLocations];
    setSavedLocations([]);
    for (const loc of oldList) {
      await removeFromDb(loc);
    }
  }

  // Help From Gemini 2.5 Flash create the basic frontend
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      {/* REMOVED <style>{customStyles}</style> HERE */}
      
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
                  <Cloud className="w-6 h-6" />
              </div>
              WeatherOrNot
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              Infrastructure Resiliency Tracker
            </p>
          </div>
          <div className="text-xs flex items-center gap-2 text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium">System Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Search & Weather Card */}
          <div className="lg:col-span-2 space-y-6">
            <LocationsPanel onSelectLocation={handleSelectLocation} />
            <ForecastPanel 
                data={weatherData} 
                loading={weatherLoading} 
                error={weatherError} 
            />
          </div>

          {/* Right Column: Saved Locations Grid */}
          <aside className="h-fit animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                Saved Locations
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                {savedLocations.length} Cities
              </span>
            </div>

            {dbLoading ? (
              <div className="text-sm text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                Syncing database...
              </div>
            ) : savedLocations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <Save className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-medium">No saved locations.</p>
                <p className="text-xs text-slate-400">Search a city to add it to your dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-1 pb-4">
                {savedLocations.map((loc) => (
                  <div
                    key={loc}
                    onClick={() => setCurrentLocation(loc)}
                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      loc === currentLocation 
                        ? "bg-blue-600 border-blue-600 shadow-md ring-2 ring-blue-100" 
                        : "bg-white border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${loc === currentLocation ? 'bg-blue-500/50 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                <MapPin className="w-5 h-5" />
                             </div>
                             <div>
                                <h3 className={`font-bold text-lg ${loc === currentLocation ? 'text-white' : 'text-slate-800'}`}>
                                    {loc}
                                </h3>
                                <div className={`text-xs flex items-center gap-1 ${loc === currentLocation ? 'text-blue-100' : 'text-slate-400'}`}>
                                    View Forecast <ArrowRight className="w-3 h-3" />
                                </div>
                             </div>
                        </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSaved(loc);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                          loc === currentLocation 
                          ? "bg-blue-700 text-white hover:bg-red-500" 
                          : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      }`}
                      title="Delete location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {savedLocations.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={handleClearAll}
                  className="w-full py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 hover:border-red-200 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
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