import React, { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import "./panelStyles.css";

export default function LocationsPanel({ onSelectLocation, suggestions = [] }) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();

    if (!query) {
      return suggestions.slice(0, 8);
    }

    return suggestions
      .filter((city) => city.toLowerCase().includes(query))
      .slice(0, 8);
  }, [inputValue, suggestions]);

  const selectCity = (city) => {
    setInputValue(city);
    onSelectLocation(city);
    setIsFocused(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const city = inputValue.trim();

    if (city) {
      selectCity(city);
    }
  };

  return (
    <div className="search-panel animate-fade-in">
      <div className="search-panel-header">
        <div>
          <h2 className="text-lg font-medium mb-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-500" />
            Search Location
          </h2>
          <p className="search-panel-copy">Type a city and choose from the autofill suggestions.</p>
        </div>
        <span className="search-panel-chip">
          <Sparkles className="w-4 h-4" />
          Smart autofill
        </span>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrap">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setIsFocused(false), 120);
            }}
            placeholder="Enter city name (e.g. Austin)"
            className="search-input"
          />

          {isFocused && filteredSuggestions.length > 0 && (
            <div className="search-suggestions" role="listbox" aria-label="City suggestions">
              {filteredSuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  className="search-suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCity(city)}
                >
                  <span className="search-suggestion-city">{city}</span>
                  <span className="search-suggestion-action">Use</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="search-submit-btn">
          Search
        </button>
      </form>
    </div>
  );
}