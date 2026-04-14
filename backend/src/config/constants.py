"""
Configuration and constants for the Weather API backend.
Centralized settings to avoid magic strings and improve maintainability.
"""

import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

# ===== API CONFIGURATION =====
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_API_BASE_URL = "http://api.weatherapi.com/v1"
WEATHER_API_TIMEOUT = 10  # seconds

# ===== DATABASE CONFIGURATION =====
SQLITE_DB_PATH = os.getenv('SQLITE_DB_PATH', 'weather_app.db')

# ===== FLASK CONFIGURATION =====
FLASK_DEBUG = os.getenv('FLASK_DEBUG', False)
FLASK_ENV = os.getenv('FLASK_ENV', 'development')

# ===== CORS CONFIGURATION =====
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')

# ===== API REFRESH INTERVALS (in minutes) =====
WEATHER_REFRESH_INTERVAL = 10  # minutes
FORECAST_REFRESH_INTERVAL = 30  # minutes
HISTORY_REFRESH_INTERVAL = 5  # minutes

# ===== WIND DIRECTION MAPPING =====
# Maps degrees to compass directions for better readability
WIND_DIRECTION_MAP = {
    0: "N",      # North
    45: "NE",    # Northeast
    90: "E",     # East
    135: "SE",   # Southeast
    180: "S",    # South
    225: "SW",   # Southwest
    270: "W",    # West
    315: "NW",   # Northwest
}

# ===== ERROR MESSAGES =====
ERROR_MISSING_API_KEY = "Server configuration error: Missing API Key"
ERROR_CITY_NOT_FOUND = "City not found"
ERROR_DATA_PARSING = "Data parsing error"
ERROR_WEATHER_NOT_FOUND = "Unable to fetch weather for the specified location"
ERROR_FORECAST_NOT_FOUND = "Unable to fetch forecast for the specified location"
ERROR_CITY_REQUIRED = "City name is required"
ERROR_CITY_ALREADY_SAVED = "City already saved"

# ===== HTTP STATUS CODES =====
STATUS_OK = 200
STATUS_CREATED = 201
STATUS_BAD_REQUEST = 400
STATUS_NOT_FOUND = 404
STATUS_CONFLICT = 409
STATUS_INTERNAL_ERROR = 500

# ===== DATA EXTRACTION FIELDS =====
# Used to map raw API response to standardized output format
ESSENTIAL_WEATHER_FIELDS = [
    "city", "country", "temp_f", "temp_c", 
    "humidity", "wind_speed_mph", "description"
]

ESSENTIAL_FORECAST_FIELDS = [
    "date", "max_temp_f", "min_temp_f", "condition", "chance_of_rain"
]
