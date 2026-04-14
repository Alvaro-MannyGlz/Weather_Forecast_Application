import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta

# 1. SETUP PATHS (MUST be before importing from src)
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# 2. IMPORTS (Now safe to import from src)
from src.config.database import SessionLocal, engine, Base
from src.models.saved_location import SavedLocation
from src.models.weather_record import WeatherRecord, ForecastRecord
from src.services.weather_api import get_weather_data, get_forecast_data

# 3. APP SETUP
"""
Flask Application Configuration and Setup

This module defines the Flask application and all API routes for the WeatherOrNot
weather dashboard. The application integrates with WeatherAPI.com external API
and stores historical data in a local database using SQLAlchemy ORM.

Architecture:
- Services Layer: weather_api.py handles all API calls and data transformation
- Data Access: SessionLocal provides database sessions for persistence
- Models: WeatherRecord, ForecastRecord, SavedLocation define the schema
- Routes: All endpoints prefixed with /api/ for REST API conventions
"""
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# --- Routes ---

# --- WEATHER ROUTE: Get current weather ---
@app.route('/api/weather/<city_name>', methods=['GET'])
def get_weather(city_name):
    """
    Get real-time weather data for a specific city and store in database.
    
    This endpoint fetches current weather conditions from WeatherAPI.com and
    persists the data to the WeatherRecord table for historical tracking.
    
    Args:
        city_name (str): City name to fetch weather for (path parameter)
    
    Returns:
        JSON: 
            - Success (200): Weather data with 25+ fields including temperature,
              wind, humidity, UV index, air quality, and location info
            - Error (404): City not found
            - Error (500): Server error during API call or database operation
    
    Example:
        GET /api/weather/Austin
        Response: {
            "city": "Austin",
            "temp_f": 85,
            "temp_c": 29,
            "condition": "Sunny",
            "humidity": 65,
            "wind_direction": "NE",
            ...
        }
    """
    try:
        # Fetch real-time data from WeatherAPI
        data = get_weather_data(city_name)

        if "error" in data:
            return jsonify(data), 404 if "not found" in data.get("error", "").lower() else 500

        # Store in database
        session = SessionLocal()
        try:
            # Create weather record
            record = WeatherRecord(
                city=data["city"],
                country=data.get("country"),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                temperature_f=data["temp_f"],
                temperature_c=data["temp_c"],
                humidity=data["humidity"],
                wind_speed_mph=data["wind_speed_mph"],
                wind_speed_kmh=data.get("wind_speed_kmh", 0),
                wind_degree=data.get("wind_degree"),
                wind_direction=data.get("wind_direction"),
                condition=data["description"],
                visibility_miles=data.get("visibility_miles"),
                pressure_mb=data.get("pressure_mb"),
                recorded_at=datetime.utcnow()
            )
            session.add(record)
            session.commit()
            
            # Return weather data with database ID
            response = data.copy()
            response["id"] = record.id
            response["recorded_at"] = record.recorded_at.isoformat()
            return jsonify(response)
        finally:
            session.close()
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# --- WEATHER ROUTE: Get forecast data ---
@app.route('/api/forecast/<city_name>', methods=['GET'])
def get_forecast(city_name):
    """
    Get weather forecast data for a specific city (next 7 days).
    
    Fetches multi-day forecast from WeatherAPI.com and stores each day's
    forecast in the ForecastRecord table for tracking forecast changes over time.
    
    Args:
        city_name (str): City name to fetch forecast for (path parameter)
    
    Returns:
        JSON:
            - Success (200): Forecast array with 7 days of data, each containing
              temperature ranges, conditions, precipitation, wind, and UV index
            - Error (404): City not found
            - Error (500): Server error during API call or database operation
    
    Example:
        GET /api/forecast/Austin
        Response: {
            "city": "Austin",
            "forecast": [
                {
                    "date": "2024-01-15",
                    "weekday": "Monday",
                    "max_temp_f": 88,
                    "min_temp_f": 72,
                    "condition": "Partly Cloudy",
                    ...
                },
                ...
            ]
        }
    """
    try:
        # Fetch forecast from WeatherAPI
        forecast = get_forecast_data(city_name)

        if "error" in forecast:
            return jsonify(forecast), 404 if "not found" in forecast.get("error", "").lower() else 500

        # Store in database
        session = SessionLocal()
        try:
            for day_forecast in forecast["forecast"]:
                record = ForecastRecord(
                    city=forecast["city"],
                    forecast_date=datetime.fromisoformat(day_forecast["date"]),
                    max_temp_f=day_forecast["max_temp_f"],
                    min_temp_f=day_forecast["min_temp_f"],
                    avg_temp_f=day_forecast["avg_temp_f"],
                    max_temp_c=day_forecast.get("max_temp_c"),
                    min_temp_c=day_forecast.get("min_temp_c"),
                    avg_temp_c=day_forecast.get("avg_temp_c"),
                    condition=day_forecast["condition"],
                    chance_of_rain=day_forecast.get("chance_of_rain", 0),
                    chance_of_snow=day_forecast.get("chance_of_snow", 0),
                    max_wind_mph=day_forecast.get("max_wind_mph"),
                    avg_wind_mph=day_forecast.get("avg_wind_mph"),
                    humidity=day_forecast.get("humidity"),
                    uv_index=day_forecast.get("uv_index"),
                    visibility_miles=day_forecast.get("visibility_miles"),
                )
                session.add(record)
            session.commit()
            return jsonify(forecast)
        finally:
            session.close()
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# --- SAVED LOCATIONS ROUTE ---
@app.route('/api/saved-locations', methods=['GET'])
def get_locations():
    """
    Get all saved city locations.
    
    Retrieves the user's saved favorite cities from the SavedLocation table.
    Used by the frontend to populate the "My Locations" section.
    
    Returns:
        JSON: Array of saved locations with id and city name
        
    Example:
        GET /api/saved-locations
        Response: [
            {"id": 1, "city": "Austin"},
            {"id": 2, "city": "New York"},
            {"id": 3, "city": "San Francisco"}
        ]
    """
    session = SessionLocal()
    try:
        locations = session.query(SavedLocation).all()
        results = [{"id": loc.id, "city": loc.city} for loc in locations]
        return jsonify(results)
    finally:
        session.close()


@app.route('/api/saved-locations', methods=['POST'])
def save_location():
    """
    Save a new city location to favorites.
    
    Adds a city to the user's saved locations. Prevents duplicates by checking
    if the city already exists before inserting.
    
    Request Body:
        JSON: {"city": "Austin"}
    
    Returns:
        JSON:
            - Success (201): {"id": 5, "city": "Austin"}
            - Error (400): City name is required
            - Error (409): City already saved (returns existing id)
            - Error (500): Server error
    
    Example:
        POST /api/saved-locations
        Body: {"city": "Austin"}
        Response: {"id": 5, "city": "Austin"} (201 Created)
    """
    try:
        data = request.get_json()
        city = data.get("city", "").strip()
        
        if not city:
            return jsonify({"error": "City name is required"}), 400
        
        session = SessionLocal()
        try:
            # Check if already exists
            existing = session.query(SavedLocation).filter_by(city=city).first()
            if existing:
                return jsonify({"error": "City already saved", "id": existing.id}), 409
            
            # Create new location
            location = SavedLocation(city=city)
            session.add(location)
            session.commit()
            
            return jsonify({"id": location.id, "city": location.city}), 201
        finally:
            session.close()
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/saved-locations/<int:location_id>', methods=['DELETE'])
def delete_location(location_id):
    """
    Delete a saved location from favorites.
    
    Removes a city from the user's saved locations by ID.
    
    Args:
        location_id (int): ID of the saved location to delete (path parameter)
    
    Returns:
        JSON:
            - Success (200): {"message": "Location deleted"}
            - Error (404): Location not found
            - Error (500): Server error
    
    Example:
        DELETE /api/saved-locations/5
        Response: {"message": "Location deleted"} (200 OK)
    """
    session = SessionLocal()
    try:
        location = session.query(SavedLocation).filter_by(id=location_id).first()
        if not location:
            return jsonify({"error": "Location not found"}), 404
        
        session.delete(location)
        session.commit()
        return jsonify({"message": "Location deleted"}), 200
    finally:
        session.close()


# --- WEATHER HISTORY ROUTE ---
@app.route('/api/weather-history/<city_name>', methods=['GET'])
def get_weather_history(city_name):
    """
    Get historical weather records for a city.
    
    Retrieves past weather observations stored in the WeatherRecord table.
    Useful for showing how weather conditions have changed over time.
    
    Args:
        city_name (str): City name to retrieve history for (path parameter)
        hours (int): Number of hours to look back (query param, default=24)
    
    Returns:
        JSON: Array of weather records with timestamps and conditions
        
    Example:
        GET /api/weather-history/Austin?hours=24
        Response: {
            "city": "Austin",
            "hours": 24,
            "count": 12,
            "records": [
                {
                    "id": 1,
                    "city": "Austin",
                    "temperature_f": 85,
                    "humidity": 65,
                    "recorded_at": "2024-01-15T10:00:00"
                },
                ...
            ]
        }
    """
    try:
        hours = request.args.get('hours', 24, type=int)
        
        session = SessionLocal()
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            records = session.query(WeatherRecord).filter(
                WeatherRecord.city.ilike(city_name),
                WeatherRecord.recorded_at >= cutoff_time
            ).order_by(WeatherRecord.recorded_at.asc()).all()
            
            data = [record.to_dict() for record in records]
            return jsonify({
                "city": city_name,
                "hours": hours,
                "records": data,
                "count": len(data)
            })
        finally:
            session.close()
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# --- FORECAST HISTORY ROUTE ---
@app.route('/api/forecast-history/<city_name>', methods=['GET'])
def get_forecast_history(city_name):
    """
    Get forecast records for a city.
    
    Retrieves stored forecast data from the ForecastRecord table.
    Shows multi-day forecasts from the most recent API call for comparison.
    
    Args:
        city_name (str): City name to retrieve forecasts for (path parameter)
    
    Returns:
        JSON: Array of forecast records organized by forecast date
        
    Example:
        GET /api/forecast-history/Austin
        Response: {
            "city": "Austin",
            "count": 7,
            "forecast_records": [
                {
                    "id": 1,
                    "city": "Austin",
                    "forecast_date": "2024-01-16",
                    "max_temp_f": 88,
                    "min_temp_f": 72,
                    "condition": "Sunny"
                },
                ...
            ]
        }
    """
    try:
        session = SessionLocal()
        try:
            today = datetime.utcnow()
            records = session.query(ForecastRecord).filter(
                ForecastRecord.city.ilike(city_name),
                ForecastRecord.forecast_date >= today
            ).order_by(ForecastRecord.forecast_date.asc()).all()
            
            data = [record.to_dict() for record in records]
            return jsonify({
                "city": city_name,
                "forecast_records": data,
                "count": len(data)
            })
        finally:
            session.close()
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# --- HEALTH CHECK ---
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for monitoring application status.
    
    Returns a simple response to verify the API is running and responsive.
    Use this endpoint to ensure the server is available before making
    additional requests.
    
    Returns:
        JSON: {"status": "ok", "timestamp": "2024-01-15T10:30:00.123456"}
    
    Example:
        GET /api/health
        Response: {"status": "ok", "timestamp": "2024-01-15T10:30:00.123456"} (200 OK)
    """
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)