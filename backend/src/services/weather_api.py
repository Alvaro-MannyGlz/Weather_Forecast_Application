import os
import requests
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

API_KEY = os.getenv("WEATHER_API_KEY")
BASE_URL = "http://api.weatherapi.com/v1/current.json"

def get_weather_data(city_name):
    """
    Fetches real-time weather from WeatherAPI.com
    """
    if not API_KEY:
        return {"error": "Server configuration error: Missing API Key"}

    try:
        # 2. Build the URL 
        # WeatherAPI uses 'key' and 'q'. It returns both C and F automatically.
        url = f"{BASE_URL}?key={API_KEY}&q={city_name}"
        
        response = requests.get(url)
        data = response.json()

        # 3. Check for errors (WeatherAPI returns an 'error' object on failure)
        if response.status_code != 200:
            error_msg = data.get("error", {}).get("message", "City not found")
            return {"error": error_msg}

        # 4. Clean up the data (Mapping WeatherAPI structure to our App's structure)
        # We use 'temp_f' for Fahrenheit and 'wind_mph' for speed
        return {
            "city": data["location"]["name"],
            "temp": round(data["current"]["temp_f"]),
            "description": data["current"]["condition"]["text"], 
            "humidity": data["current"]["humidity"],
            "wind_speed": data["current"]["wind_mph"]
        }

    except Exception as e:
        return {"error": f"Data parsing error: {str(e)}"}