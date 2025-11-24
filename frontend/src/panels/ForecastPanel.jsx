import React, { useRef, useEffect, useState, useMemo } from "react";
import { Sun, CloudRain } from "lucide-react";
import "./panelStyles.css";

export default function ForecastPanel({ location = "Unknown" }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const gap = 12; // px between items

  // build 7 days dataset
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() + i * 86400000);
      arr.push({
        id: i,
        weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
        dateStr: d.toLocaleDateString(),
        temp: 68 + i * 1.5,
        isRain: i % 3 === 0,
        desc: i % 3 === 0 ? "Rainy" : i % 2 === 0 ? "Sunny" : "Cloudy",
      });
    }
    return arr;
  }, []);

  // compute visibleCount based on container width
  useEffect(() => {
    function recompute() {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth || 0;
      setContainerWidth(w);

      // responsive visible counts:
      // desktop wide: 5, large:4, medium:3, small:2, tiny:1
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

  // item width such that exactly visibleCount items fit (account gap)
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

  return (
    <div className="forecast-panel">
      <div className="forecast-header">
        <div>
          <h3 className="forecast-title">{location}</h3>
          <div className="forecast-sub">7-day forecast</div>
        </div>

        <div className="forecast-controls">
          <button
            className="slider-button"
            onClick={() => scrollByPage(-1)}
            aria-hidden={!canScrollLeft}
            disabled={!canScrollLeft}
            title="Scroll left"
          >
            ‹
          </button>
          <button
            className="slider-button"
            onClick={() => scrollByPage(1)}
            aria-hidden={!canScrollRight}
            disabled={!canScrollRight}
            title="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div ref={containerRef} className="forecast-slider-container">
        <div
          ref={trackRef}
          className="forecast-track"
          style={{ gap: `${gap}px`, paddingBottom: 4 }}
        >
          {days.map((d) => (
            <div
              key={d.id}
              className="forecast-day"
              style={{
                minWidth: `${itemWidth}px`,
                maxWidth: `${itemWidth}px`,
              }}
            >
              <div className="day-week">{d.weekday}</div>

              <div className="day-icon">
                {d.isRain ? <CloudRain size={30} /> : <Sun size={30} />}
              </div>

              <div className="day-temp">{Math.round(d.temp)}°</div>
              <div className="day-desc">{d.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}