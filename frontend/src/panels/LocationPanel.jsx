import React, { useState } from "react";

export default function LocationsPanel({ onSelectLocation }) {
  const [input, setInput] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSelectLocation(input.trim());
    setInput("");
  };

  return (
    <section className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-xl font-semibold">Locations</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Search a city or ZIP code.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a city or ZIP..."
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 text-white rounded-md"
        >
          Go
        </button>
      </form>
    </section>
  );
}