import os
import logging
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Load .env
load_dotenv()

WEATHERAPI_KEY = os.environ.get("WEATHERAPI_KEY", "")
if not WEATHERAPI_KEY:
    logging.warning("WEATHERAPI_KEY is not set. Requests will likely fail.")

DEFAULT_PORT = int(os.environ.get("PORT", 3001))
TIMEOUT = float(os.environ.get("UPSTREAM_TIMEOUT", 10.0))

app = Flask(__name__)
CORS(app)  # allow cross-origin for dev

# Basic logging
logging.basicConfig(level=logging.INFO)
app.logger.info("Logging initialized.")


def forward_to_weatherapi(endpoint: str):
    """Forward request to WeatherAPI, inject server-side API key."""
    params = dict(request.args)
    params["key"] = WEATHERAPI_KEY
    upstream = f"https://api.weatherapi.com/v1/{endpoint}.json"

    try:
        resp = requests.get(upstream, params=params, timeout=TIMEOUT)
    except requests.RequestException as exc:
        app.logger.error("Upstream request failed: %s", exc)
        return jsonify({"error": "Failed to contact WeatherAPI"}), 502

    content_type = resp.headers.get("Content-Type", "application/json")
    return Response(resp.content, status=resp.status_code, content_type=content_type)


@app.route("/current.json")
def current():
    return forward_to_weatherapi("current")


@app.route("/forecast.json")
def forecast():
    return forward_to_weatherapi("forecast")


@app.route("/health")
def health():
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.logger.info(f"Starting Flask Weather proxy on 0.0.0.0:{DEFAULT_PORT}")
    app.run(host="0.0.0.0", port=DEFAULT_PORT, debug=False)