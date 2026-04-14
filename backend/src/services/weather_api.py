"""
Weather API Service

Uses WeatherAPI when WEATHER_API_KEY is configured.
Falls back to Open-Meteo (no key required) when no key is present.
"""

import math
import requests
from datetime import datetime
from src.config.constants import (
    WEATHER_API_KEY,
    WEATHER_API_BASE_URL,
    WEATHER_API_TIMEOUT,
    WIND_DIRECTION_MAP,
    ERROR_DATA_PARSING,
)

OPEN_METEO_GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

OPEN_METEO_WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def _get_wind_direction(wind_degree):
    """
    Convert numeric wind degree to compass direction.
    
    Args:
        wind_degree (int/float): Direction in degrees (0-360)
    
    Returns:
        str: Compass direction (N, NE, E, SE, S, SW, W, NW)
    """
    if wind_degree is None:
        return "N"
    
    # Round to nearest 45-degree direction
    rounded_degree = round(wind_degree / 45) * 45
    return WIND_DIRECTION_MAP.get(rounded_degree % 360, "N")


def _handle_api_error(response, default_message="City not found"):
    """
    Extract and format error message from API response.
    
    Args:
        response (requests.Response): API response object
        default_message (str): Default error message if parsing fails
    
    Returns:
        dict: Error response dictionary
    """
    try:
        data = response.json()
        error_msg = data.get("error", {}).get("message", default_message)
    except Exception:
        error_msg = default_message
    
    return {"error": error_msg}


def _c_to_f(temp_c):
    return (temp_c * 9 / 5) + 32


def _estimate_dew_point_f(temp_c, humidity):
    """Estimate dew point using Magnus formula and return Fahrenheit."""
    try:
        rh = max(1.0, min(float(humidity), 100.0)) / 100.0
        a = 17.27
        b = 237.7
        gamma = (a * temp_c / (b + temp_c)) + math.log(rh)
        dew_c = (b * gamma) / (a - gamma)
        return round(_c_to_f(dew_c))
    except Exception:
        return 0


def _geocode_city(city_name):
    params = {
        "name": city_name,
        "count": 1,
        "language": "en",
        "format": "json",
    }
    response = requests.get(OPEN_METEO_GEOCODE_URL, params=params, timeout=WEATHER_API_TIMEOUT)
    if response.status_code != 200:
        return None
    payload = response.json()
    results = payload.get("results") or []
    return results[0] if results else None


def _get_open_meteo_payload(latitude, longitude, timezone, days):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": timezone or "auto",
        "current": (
            "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,"
            "weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,"
            "wind_gusts_10m,visibility"
        ),
        "daily": (
            "weather_code,temperature_2m_max,temperature_2m_min,"
            "precipitation_probability_max,precipitation_sum,snowfall_sum,"
            "wind_speed_10m_max,uv_index_max,relative_humidity_2m_mean"
        ),
        "forecast_days": days,
    }
    response = requests.get(OPEN_METEO_FORECAST_URL, params=params, timeout=WEATHER_API_TIMEOUT)
    if response.status_code != 200:
        return None
    return response.json()


def _get_weather_data_open_meteo(city_name):
    place = _geocode_city(city_name)
    if not place:
        return {"error": "City not found"}

    latitude = place.get("latitude")
    longitude = place.get("longitude")
    timezone = place.get("timezone") or "auto"
    payload = _get_open_meteo_payload(latitude, longitude, timezone, days=7)
    if not payload:
        return {"error": "Unable to fetch weather data"}

    current = payload.get("current", {})
    temp_c = float(current.get("temperature_2m", 0.0))
    feels_c = float(current.get("apparent_temperature", temp_c))
    humidity = int(round(current.get("relative_humidity_2m", 0) or 0))
    weather_code = int(current.get("weather_code", 0) or 0)

    visibility_m = float(current.get("visibility", 0.0) or 0.0)
    visibility_km = round(visibility_m / 1000.0, 1)
    visibility_miles = round(visibility_m / 1609.344, 1)

    wind_speed_kmh = float(current.get("wind_speed_10m", 0.0) or 0.0)
    wind_speed_mph = round(wind_speed_kmh / 1.609344, 1)
    wind_gust_kmh = float(current.get("wind_gusts_10m", 0.0) or 0.0)
    wind_gust_mph = round(wind_gust_kmh / 1.609344, 1)

    wind_degree = int(round(current.get("wind_direction_10m", 0) or 0))
    wind_direction = _get_wind_direction(wind_degree)
    pressure_mb = float(current.get("pressure_msl", 0.0) or 0.0)

    return {
        "city": place.get("name", city_name),
        "country": place.get("country", "Unknown"),
        "region": place.get("admin1", ""),
        "latitude": latitude,
        "longitude": longitude,
        "timezone": payload.get("timezone", timezone),
        "temp_f": round(_c_to_f(temp_c)),
        "temp_c": round(temp_c),
        "description": OPEN_METEO_WEATHER_CODE_MAP.get(weather_code, "Unknown"),
        "condition_code": weather_code,
        "is_day": int(current.get("is_day", 1) or 1),
        "wind_speed_mph": wind_speed_mph,
        "wind_speed_kmh": round(wind_speed_kmh, 1),
        "wind_degree": wind_degree,
        "wind_direction": wind_direction,
        "wind_gust_mph": wind_gust_mph,
        "humidity": humidity,
        "pressure_mb": round(pressure_mb, 1),
        "pressure_in": round(pressure_mb * 0.02953, 2),
        "visibility_miles": visibility_miles,
        "visibility_km": visibility_km,
        "feels_like_f": round(_c_to_f(feels_c)),
        "feels_like_c": round(feels_c),
        "uv_index": 0,
        "dew_point_f": _estimate_dew_point_f(temp_c, humidity),
        "air_quality": None,
        "last_updated": current.get("time", datetime.utcnow().isoformat()),
    }


def _get_forecast_data_open_meteo(city_name, days=7):
    place = _geocode_city(city_name)
    if not place:
        return {"error": "City not found"}

    latitude = place.get("latitude")
    longitude = place.get("longitude")
    timezone = place.get("timezone") or "auto"
    payload = _get_open_meteo_payload(latitude, longitude, timezone, days=days)
    if not payload:
        return {"error": "Unable to fetch forecast data"}

    daily = payload.get("daily", {})
    dates = daily.get("time", [])
    max_c = daily.get("temperature_2m_max", [])
    min_c = daily.get("temperature_2m_min", [])
    codes = daily.get("weather_code", [])
    rain_chance = daily.get("precipitation_probability_max", [])
    precip_mm = daily.get("precipitation_sum", [])
    snow_cm = daily.get("snowfall_sum", [])
    max_wind_kmh = daily.get("wind_speed_10m_max", [])
    uv_index = daily.get("uv_index_max", [])
    humidity = daily.get("relative_humidity_2m_mean", [])

    forecast_days = []
    for idx, date_str in enumerate(dates):
        hi_c = float(max_c[idx]) if idx < len(max_c) else 0.0
        lo_c = float(min_c[idx]) if idx < len(min_c) else 0.0
        avg_c = (hi_c + lo_c) / 2.0
        code = int(codes[idx]) if idx < len(codes) else 0
        chance = int(rain_chance[idx]) if idx < len(rain_chance) else 0
        precip = float(precip_mm[idx]) if idx < len(precip_mm) else 0.0
        snow = float(snow_cm[idx]) if idx < len(snow_cm) else 0.0
        wind_kmh = float(max_wind_kmh[idx]) if idx < len(max_wind_kmh) else 0.0
        hum = int(humidity[idx]) if idx < len(humidity) else 0
        uv = float(uv_index[idx]) if idx < len(uv_index) else 0.0

        forecast_days.append(
            {
                "date": date_str,
                "weekday": datetime.fromisoformat(date_str).strftime("%A"),
                "max_temp_f": round(_c_to_f(hi_c)),
                "min_temp_f": round(_c_to_f(lo_c)),
                "avg_temp_f": round(_c_to_f(avg_c)),
                "max_temp_c": round(hi_c),
                "min_temp_c": round(lo_c),
                "avg_temp_c": round(avg_c),
                "condition": OPEN_METEO_WEATHER_CODE_MAP.get(code, "Unknown"),
                "condition_code": code,
                "chance_of_rain": chance,
                "chance_of_snow": 100 if snow > 0 else 0,
                "total_precipitation_mm": round(precip, 2),
                "total_snow_cm": round(snow, 2),
                "max_wind_mph": round(wind_kmh / 1.609344, 1),
                "max_wind_kmh": round(wind_kmh, 1),
                "avg_wind_mph": round((wind_kmh / 1.609344) * 0.7, 1),
                "humidity": hum,
                "visibility_miles": 0,
                "uv_index": uv,
                "will_it_rain": chance > 0,
                "will_it_snow": snow > 0,
            }
        )

    return {
        "city": place.get("name", city_name),
        "country": place.get("country", "Unknown"),
        "region": place.get("admin1", ""),
        "latitude": latitude,
        "longitude": longitude,
        "timezone": payload.get("timezone", timezone),
        "forecast": forecast_days,
        "days_count": len(forecast_days),
        "fetched_at": datetime.utcnow().isoformat(),
    }


def get_weather_data(city_name):
    """
    Fetch real-time weather data from WeatherAPI.com
    
    Retrieves comprehensive weather information including:
    - Temperature (Fahrenheit & Celsius)
    - Wind speed, direction, and gust force
    - Humidity, pressure, visibility
    - UV index, dew point
    - Air quality metrics
    - Location details (coordinates, timezone)
    
    Args:
        city_name (str): City name to fetch weather for
    
    Returns:
        dict: Weather data with all metrics, or error dict if request fails
    
    Example:
        >>> data = get_weather_data("Austin")
        >>> print(data['temp_f'], data['condition'])
    """
    if not WEATHER_API_KEY:
        return _get_weather_data_open_meteo(city_name)

    try:
        # Build URL with query parameters
        # 'aqi=yes' includes air quality data
        url = f"{WEATHER_API_BASE_URL}/current.json"
        params = {
            "key": WEATHER_API_KEY,
            "q": city_name,
            "aqi": "yes",  # Include air quality information
        }
        
        # Make request with timeout to prevent hanging
        response = requests.get(url, params=params, timeout=WEATHER_API_TIMEOUT)
        data = response.json()

        # Handle HTTP errors
        if response.status_code != 200:
            return _handle_api_error(response)

        # Extract location and weather data
        location = data["location"]
        current = data["current"]

        # Extract wind direction from degree measurement
        wind_degree = current.get("wind_degree", 0)
        wind_direction = _get_wind_direction(wind_degree)

        # Build comprehensive response object
        return {
            # Location information
            "city": location["name"],
            "country": location["country"],
            "region": location["region"],
            "latitude": location["lat"],
            "longitude": location["lon"],
            "timezone": location["tz_id"],
            
            # Temperature (both Fahrenheit and Celsius)
            "temp_f": round(current["temp_f"]),
            "temp_c": round(current["temp_c"]),
            
            # Weather condition
            "description": current["condition"]["text"],
            "condition_code": current["condition"]["code"],
            "is_day": current["is_day"],
            
            # Wind measurements
            "wind_speed_mph": round(current["wind_mph"], 1),
            "wind_speed_kmh": round(current["wind_kph"], 1),
            "wind_degree": wind_degree,
            "wind_direction": wind_direction,
            "wind_gust_mph": round(current.get("gust_mph", 0), 1),
            
            # Humidity and atmospheric pressure
            "humidity": current["humidity"],
            "pressure_mb": current["pressure_mb"],
            "pressure_in": round(current["pressure_in"], 2),
            
            # Visibility
            "visibility_miles": round(current["vis_miles"], 1),
            "visibility_km": current["vis_km"],
            
            # UV index and dew point
            "feels_like_f": round(current["feelslike_f"]),
            "feels_like_c": round(current["feelslike_c"]),
            "uv_index": current.get("uv", 0),
            "dew_point_f": round(current.get("dewpoint_f", 0)),
            
            # Air quality (present only if aqi=yes in request)
            "air_quality": current.get("air_quality", {}) if current.get("air_quality") else None,
            
            # Last update timestamp from API
            "last_updated": current["last_updated"],
        }
    
    except requests.exceptions.Timeout:
        return {"error": "Request timeout - API server not responding"}
    except requests.exceptions.ConnectionError:
        return {"error": "Connection error - unable to reach weather API"}
    except Exception as e:
        return {"error": f"{ERROR_DATA_PARSING}: {str(e)}"}


def get_forecast_data(city_name, days=7):
    """
    Fetch weather forecast from WeatherAPI.com
    
    Retrieves multi-day forecast including:
    - Temperature ranges (max, min, average) in both F and C
    - Weather conditions and precipitation probability
    - Wind speed and direction
    - Humidity and UV index
    - Precipitation amounts
    
    Args:
        city_name (str): City name to fetch forecast for
        days (int): Number of days to forecast (1-10, default 7)
    
    Returns:
        dict: Forecast data organized by day, or error dict if request fails
    
    Example:
        >>> forecast = get_forecast_data("Austin", days=7)
        >>> for day in forecast['forecast']:
        ...     print(day['date'], day['condition'])
    """
    if not WEATHER_API_KEY:
        return _get_forecast_data_open_meteo(city_name, days=days)

    try:
        # Ensure days parameter is within valid range
        days = max(1, min(days, 10))
        
        # Build URL with query parameters
        url = f"{WEATHER_API_BASE_URL}/forecast.json"
        params = {
            "key": WEATHER_API_KEY,
            "q": city_name,
            "days": days,
            "aqi": "yes",
        }
        
        # Make request with timeout
        response = requests.get(url, params=params, timeout=WEATHER_API_TIMEOUT)
        data = response.json()

        # Handle HTTP errors
        if response.status_code != 200:
            return _handle_api_error(response)

        # Extract location
        location = data["location"]
        
        # Process each day's forecast
        forecast_days = []
        
        for day_data in data["forecast"]["forecastday"]:
            date_str = day_data["date"]
            day_info = day_data["day"]
            
            forecast_days.append({
                # Date information
                "date": date_str,
                "weekday": datetime.fromisoformat(date_str).strftime("%A"),
                
                # Temperature ranges in Fahrenheit
                "max_temp_f": round(day_info["maxtemp_f"]),
                "min_temp_f": round(day_info["mintemp_f"]),
                "avg_temp_f": round(day_info["avgtemp_f"]),
                
                # Temperature ranges in Celsius
                "max_temp_c": round(day_info["maxtemp_c"]),
                "min_temp_c": round(day_info["mintemp_c"]),
                "avg_temp_c": round(day_info["avgtemp_c"]),
                
                # Weather condition
                "condition": day_info["condition"]["text"],
                "condition_code": day_info["condition"]["code"],
                
                # Precipitation probability and amounts
                "chance_of_rain": day_info["daily_chance_of_rain"],
                "chance_of_snow": day_info["daily_chance_of_snow"],
                "total_precipitation_mm": day_info["totalprecip_mm"],
                "total_snow_cm": day_info["totalsnow_cm"],
                
                # Wind measurements
                "max_wind_mph": round(day_info["maxwind_mph"], 1),
                "max_wind_kmh": round(day_info["maxwind_kph"], 1),
                "avg_wind_mph": round(day_info.get("avgwind_mph", 0), 1),
                
                # Other metrics
                "humidity": day_info["avghumidity"],
                "visibility_miles": round(day_info["avgvis_miles"], 1),
                "uv_index": day_info["uv"],
                
                # Boolean indicators
                "will_it_rain": day_info["daily_will_it_rain"] == 1,
                "will_it_snow": day_info["daily_will_it_snow"] == 1,
            })
        
        # Return response with location context
        return {
            "city": location["name"],
            "country": location["country"],
            "region": location["region"],
            "latitude": location["lat"],
            "longitude": location["lon"],
            "timezone": location["tz_id"],
            "forecast": forecast_days,
            "days_count": len(forecast_days),
            "fetched_at": datetime.now().isoformat(),
        }
    
    except requests.exceptions.Timeout:
        return {"error": "Request timeout - API server not responding"}
    except requests.exceptions.ConnectionError:
        return {"error": "Connection error - unable to reach weather API"}
    except Exception as e:
        return {"error": f"{ERROR_DATA_PARSING}: {str(e)}"}
