from flask import Flask, request, jsonify, send_from_directory
import requests
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)
API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()

BASE_URL = "https://api.openweathermap.org/data/2.5"

@app.route('/api/geocode')
def geocode():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City name required'}), 400
    url = f"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"
    res = requests.get(url)
    return jsonify(res.json())

@app.route('/api/forecast')
def forecast():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Coordinates required'}), 400

    current_url = f"{BASE_URL}/weather?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"
    forecast_url = f"{BASE_URL}/forecast?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"

    current_data = requests.get(current_url).json()
    forecast_data = requests.get(forecast_url).json()

    if "cod" in current_data and str(current_data["cod"]) != "200":
        return jsonify({'error': 'Weather unavailable'}), 404

    return jsonify({
        "current": current_data,
        "forecast": forecast_data
    })

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
