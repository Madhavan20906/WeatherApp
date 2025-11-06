from flask import Flask, jsonify, request
import requests

app = Flask(__name__)
API_KEY = "YOUR_API_KEY"

@app.route("/weather")
def weather():
    city = request.args.get("city")
    geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"
    geo = requests.get(geo_url).json()
    if not geo:
        return jsonify({"error": "City not found"}), 404

    lat, lon = geo[0]["lat"], geo[0]["lon"]
    weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"

    weather = requests.get(weather_url).json()
    forecast = requests.get(forecast_url).json()
    return jsonify({"weather": weather, "forecast": forecast})

if __name__ == "__main__":
    app.run(debug=True)
