import React, { useRef, useEffect, useState, useMemo } from "react";
import { Sun, CloudRain, Cloud, AlertCircle } from "lucide-react";
import { useForecast } from "../hooks/useWeather";
import "./panelStyles.css";

/**
 * ForecastPanel - Displays 7-day forecast with scrollable forecast cards
 */
export default function ForecastPanel({ location = "Unknown" }) {
  const { forecast, loading, error } = useForecast(location);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const gap = 12; // px between items

  // Compute forecast days data
  const days = useMemo(() => {
    if (!forecast || !forecast.forecast) {
      return [];
    }
    return forecast.forecast.map((day, index) => ({
      id: index,
      date: day.date,
      weekday: day.weekday,
      maxTemp: day.max_temp_f,
      minTemp: day.min_temp_f,
      condition: day.condition,
      chanceOfRain: day.chance_of_rain,
      isRain: day.chance_of_rain > 30,
      icon: getWeatherIcon(day.condition),
    }));
  }, [forecast]);

  // Get weather icon based on condition
  function getWeatherIcon(condition) {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
      return "rain";
    }
    if (lowerCondition.includes("cloud")) {
      return "cloud";
    }
    return "sun";
  }

  // Compute visibleCount based on container width
  useEffect(() => {
    function recompute() {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth || 0;
      setContainerWidth(w);

      // responsive visible counts
      if (w >= 1200) setVisibleCount(5);
      else if (w >= 1000) setVisibleCount(4);
      else if (w >= 700) setVisibleCount(3);
      else if (w >= 420) setVisibleCount(2);
      else setVisibleCount(1);
    }

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  // item width calculation
  const itemWidth = Math.max(
    100,
    Math.floor((containerWidth - gap * (visibleCount - 1)) / visibleCount)
  );

  // scroll helpers
  const scrollByPage = (dir = 1) => {
    if (!trackRef.current) return;
    const scrollAmount = (itemWidth + gap) * visibleCount * dir;
    trackRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // show/hide arrows depending on scroll position
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    function update() {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [itemWidth, visibleCount, days.length]);

  if (error) {
    return (
      <div className="forecast-panel">
        <div className="error-message">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forecast-panel">
      <div className="forecast-header">
        <div>
          <h3 className="forecast-title">{location}</h3>
          <div className="forecast-sub">
            {loading ? "Loading forecast..." : "7-day forecast"}
          </div>
        </div>

        <div className="forecast-controls">
          <button
            className="slider-button"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            className="slider-button"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div className="forecast-container" ref={containerRef}>
        <div className="forecast-track" ref={trackRef}>
          {loading ? (
            <div className="forecast-loading">Loading...</div>
          ) : days.length === 0 ? (
            <div className="forecast-empty">No forecast data available</div>
          ) : (
            days.map((day) => (
              <div
                key={day.id}
                className="forecast-card"
                style={{ width: `${itemWidth}px` }}
              >
                <div className="forecast-date">
                  <div className="forecast-weekday">{day.weekday}</div>
                  <div className="forecast-datestr">{day.date}</div>
                </div>

                <div className="forecast-icon">
                  {day.icon === "rain" ? (
                    <CloudRain size={32} className="icon-rain" />
                  ) : day.icon === "cloud" ? (
                    <Cloud size={32} className="icon-cloud" />
                  ) : (
                    <Sun size={32} className="icon-sun" />
                  )}
                </div>

                <div className="forecast-condition">{day.condition}</div>

                <div className="forecast-temps">
                  <div className="temp-max">{day.maxTemp}°</div>
                  <div className="temp-min">{day.minTemp}°</div>
                </div>

                <div className="forecast-rain">
                  <span>💧 {day.chanceOfRain}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}