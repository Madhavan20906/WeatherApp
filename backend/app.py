from flask import Flask, request, jsonify, send_from_directory
import requests
from flask_cors import CORS
import os

# ✅ Serve your frontend folder correctly (relative path works for Render)
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# 🔑 Use environment variable for API key in production
API_KEY = os.getenv("OPENWEATHER_API_KEY", "76a29193e6116604879b4db2133ef505")
BASE_URL = "https://api.openweathermap.org/data/2.5"


# 🌍 Geocoding endpoint (city → lat/lon)
@app.route('/api/geocode')
def geocode():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City name required'}), 400

    # ✅ Use HTTPS for all requests
    url = f"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"

    try:
        res = requests.get(url, timeout=5)
        res.raise_for_status()
        return jsonify(res.json())
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to fetch geocode: {str(e)}'}), 500


# ☁️ Weather + Forecast endpoint
@app.route('/api/forecast')
def forecast():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Coordinates required'}), 400

    try:
        current_url = f"{BASE_URL}/weather?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"
        forecast_url = f"{BASE_URL}/forecast?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"

        current_data = requests.get(current_url, timeout=5).json()
        forecast_data = requests.get(forecast_url, timeout=5).json()

        # ✅ Handle API errors gracefully
        if "cod" in current_data and str(current_data["cod"]) != "200":
            return jsonify({'error': 'Weather unavailable'}), 404

        return jsonify({
            "current": current_data,
            "forecast": forecast_data
        })

    except requests.RequestException as e:
        return jsonify({'error': f'Failed to fetch weather: {str(e)}'}), 500


# 🏠 Serve frontend index.html (for Render)
@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')


# 🚀 Entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
