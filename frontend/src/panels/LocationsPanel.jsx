import React, { useState } from "react";
import { Search, AlertCircle } from "lucide-react";


const LocationsPanel = ({ onSelectLocation }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = inputValue.trim();
    
    if (!term) return;

    // --- REGEX VALIDATION ---
    // 1. ZIP Code Regex: Matches 5 digits (e.g. 78701) or 5+4 (e.g. 78701-1234)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    
    // 2. City Name Regex: Matches letters, spaces, hyphens, apostrophes (min 2 chars)
    const cityRegex = /^[a-zA-Z\u00C0-\u00FF\s\.\-']{2,}$/;

    const isZip = zipRegex.test(term);
    const isCity = cityRegex.test(term);

    if (!isZip && !isCity) {
      setError("Please enter a valid City Name or 5-digit ZIP Code.");
      return;
    }

    // If valid, clear error and submit
    setError("");
    onSelectLocation(term);
    setInputValue("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-500" />
        Search Location
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError(""); // Clear error as user corrects it
          }}
          placeholder="Enter city (Austin) or ZIP (78701)..."
          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
            error 
              ? "border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50 text-red-900 placeholder:text-red-300" 
              : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Validation Error Message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            {error}
        </div>
      )}
    </div>
  );
};

export default LocationsPanel;