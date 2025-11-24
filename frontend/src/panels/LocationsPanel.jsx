import React, { useState } from "react";
import { Search } from "lucide-react";
import "./panelStyles.css";

export default function LocationsPanel({ onSelectLocation }) {
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
}