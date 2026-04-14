from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from src.config.database import Base


class WeatherRecord(Base):
    """Stores real-time and historical weather data"""
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    country = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Weather data
    temperature_f = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)
    humidity = Column(Integer, nullable=False)
    wind_speed_mph = Column(Float, nullable=False)
    wind_speed_kmh = Column(Float, nullable=False)
    wind_degree = Column(Integer, nullable=True)
    wind_direction = Column(String, nullable=True)
    condition = Column(String, nullable=False)  # "Sunny", "Rainy", etc.
    condition_code = Column(Integer, nullable=True)  # WeatherAPI code
    
    # Visibility and pressure
    visibility_miles = Column(Float, nullable=True)
    pressure_mb = Column(Float, nullable=True)
    
    # Recorded timestamp
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f"<WeatherRecord(city='{self.city}', temp={self.temperature_f}°F, time={self.recorded_at})>"
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "city": self.city,
            "country": self.country,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "temperature_f": self.temperature_f,
            "temperature_c": self.temperature_c,
            "humidity": self.humidity,
            "wind_speed_mph": self.wind_speed_mph,
            "wind_speed_kmh": self.wind_speed_kmh,
            "wind_degree": self.wind_degree,
            "wind_direction": self.wind_direction,
            "condition": self.condition,
            "visibility_miles": self.visibility_miles,
            "pressure_mb": self.pressure_mb,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }


class ForecastRecord(Base):
    """Stores weather forecast data"""
    __tablename__ = "forecast_records"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    
    # Forecast period
    forecast_date = Column(DateTime, index=True, nullable=False)  # Date of forecast
    hour = Column(Integer, nullable=True)  # Hour (0-23) if hourly forecast
    
    # Temperature
    max_temp_f = Column(Float, nullable=True)
    min_temp_f = Column(Float, nullable=True)
    avg_temp_f = Column(Float, nullable=True)
    
    max_temp_c = Column(Float, nullable=True)
    min_temp_c = Column(Float, nullable=True)
    avg_temp_c = Column(Float, nullable=True)
    
    # Weather conditions
    condition = Column(String, nullable=False)  # "Sunny", "Rainy", etc.
    chance_of_rain = Column(Integer, nullable=True)  # 0-100
    chance_of_snow = Column(Integer, nullable=True)  # 0-100
    total_precipitation_mm = Column(Float, nullable=True)
    
    # Wind
    max_wind_mph = Column(Float, nullable=True)
    avg_wind_mph = Column(Float, nullable=True)
    
    # Other
    humidity = Column(Integer, nullable=True)
    uv_index = Column(Float, nullable=True)
    visibility_miles = Column(Float, nullable=True)
    
    # Metadata
    fetched_at = Column(DateTime, default=datetime.utcnow)  # When the forecast was fetched
    
    def __repr__(self):
        return f"<ForecastRecord(city='{self.city}', date={self.forecast_date}, condition='{self.condition}')>"
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "city": self.city,
            "forecast_date": self.forecast_date.isoformat() if self.forecast_date else None,
            "hour": self.hour,
            "max_temp_f": self.max_temp_f,
            "min_temp_f": self.min_temp_f,
            "avg_temp_f": self.avg_temp_f,
            "max_temp_c": self.max_temp_c,
            "min_temp_c": self.min_temp_c,
            "avg_temp_c": self.avg_temp_c,
            "condition": self.condition,
            "chance_of_rain": self.chance_of_rain,
            "chance_of_snow": self.chance_of_snow,
            "total_precipitation_mm": self.total_precipitation_mm,
            "max_wind_mph": self.max_wind_mph,
            "avg_wind_mph": self.avg_wind_mph,
            "humidity": self.humidity,
            "uv_index": self.uv_index,
            "visibility_miles": self.visibility_miles,
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None,
        }
