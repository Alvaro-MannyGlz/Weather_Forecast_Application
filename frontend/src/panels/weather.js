export function getMockWeatherForDate(date) {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diff = Math.round((target - today) / 86400000);
  const temp = 68 + diff * 1.5;

  const isRain = Math.abs(diff) % 3 === 0;
  const label = isRain ? "Rainy" : diff % 2 === 0 ? "Sunny" : "Cloudy";
  const icon = isRain ? "rain" : diff % 2 === 0 ? "sun" : "cloud";

  return { temp: Math.round(temp), label, icon };
}