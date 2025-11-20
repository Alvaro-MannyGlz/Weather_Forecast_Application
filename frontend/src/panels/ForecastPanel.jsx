import React from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";

const ForecastPanel = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px] flex items-center justify-center animate-fade-in">
        <div className="text-slate-400 animate-pulse flex flex-col items-center gap-3">
            <Cloud className="w-10 h-10" />
            <span>Fetching weather data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 min-h-[300px] flex items-center justify-center animate-fade-in">
        <div className="text-red-500 text-center">
          <p className="font-bold text-lg">Error Loading Weather</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Safety checks
  const conditionText = data.condition || ""; 
  const desc = conditionText.toLowerCase();
  const isRain = desc.includes("rain") || desc.includes("drizzle");
  const isClear = desc.includes("sunny") || desc.includes("clear");
  const isClouds = desc.includes("cloud") || desc.includes("overcast");

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[300px] animate-fade-in relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
        <Cloud className="w-64 h-64" />
      </div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{data.city}</h2>
          <p className="text-slate-500 text-lg capitalize mt-1">{data.condition}</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-blue-100">
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Main Temperature Display */}
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            <div className="weather-icon-float mb-4">
                {isRain && <CloudRain className="w-20 h-20 text-blue-500" />}
                {isClear && <Sun className="w-20 h-20 text-amber-500" />}
                {isClouds && <Cloud className="w-20 h-20 text-slate-400" />}
                {!isRain && !isClear && !isClouds && <Sun className="w-20 h-20 text-amber-500" />}
            </div>
            <div className="text-7xl font-bold text-slate-800 tracking-tighter">{data.temp}°</div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    <Droplets className="w-4 h-4" /> Humidity
                </div>
                <div className="text-2xl font-semibold text-slate-700">{data.humidity}%</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    <Wind className="w-4 h-4" /> Wind
                </div>
                <div className="text-2xl font-semibold text-slate-700">{data.wind_speed} <span className="text-sm text-slate-400">mph</span></div>
            </div>
             <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center col-span-2">
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
                    <Thermometer className="w-4 h-4" /> Insight
                </div>
                <div className="text-md font-medium text-slate-700">
                    {data.temp > 85 ? "It's hot out there! Stay hydrated." : data.temp < 50 ? "It's a bit chilly. Grab a jacket." : "The weather is looking great today."}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastPanel;