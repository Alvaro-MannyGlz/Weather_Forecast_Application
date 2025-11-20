import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

# 1. SETUP PATHS (MUST be before importing from src)
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# 2. IMPORTS (Now safe to import from src)
from src.config.database import SessionLocal, engine, Base
from src.models.saved_location import SavedLocation 
# FIX: Moved this import down here so Python knows where to find it
from src.services.weather_api import get_weather_data 

# 3. APP SETUP
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# --- Routes ---

# --- WEATHER ROUTE ---
@app.route('/api/weather/<city_name>', methods=['GET'])
def get_weather(city_name):
    """Get real weather data for a specific city"""
    # This calls the function in services/weather_api.py
    data = get_weather_data(city_name)

    if "error" in data:
        # Return 404 if city not found, or 500 if API key is missing
        status = 404 if "not found" in data.get("error", "").lower() else 500
        return jsonify(data), status

    return jsonify(data)
# ---------------------

@app.route('/api/saved-locations', methods=['GET'])
def get_locations():
    """Get all saved cities"""
    session = SessionLocal()
    try:
        locations = session.query(SavedLocation).all()
        results = [{"id": loc.id, "city": loc.city} for loc in locations]
        return jsonify(results)
    finally:
        session.close()

@app.route('/api/saved-locations', methods=['POST'])
def add_location():
    """Save a new city"""
    data = request.json
    city_name = data.get("city")
    
    if not city_name:
        return jsonify({"error": "City name is required"}), 400

    session = SessionLocal()
    try:
        exists = session.query(SavedLocation).filter_by(city=city_name).first()
        if exists:
            return jsonify({"message": "City already saved"}), 200

        new_loc = SavedLocation(city=city_name)
        session.add(new_loc)
        session.commit()
        return jsonify({"message": f"Saved {city_name}"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/saved-locations/<city_name>', methods=['DELETE'])
def delete_location(city_name):
    """Delete a city"""
    session = SessionLocal()
    try:
        loc = session.query(SavedLocation).filter_by(city=city_name).first()
        if not loc:
            return jsonify({"error": "City not found"}), 404
            
        session.delete(loc)
        session.commit()
        return jsonify({"message": "Deleted"}), 200
    finally:
        session.close()

if __name__ == '__main__':
    print("🚀 Server starting on http://localhost:5000")
    app.run(debug=True, port=5000)