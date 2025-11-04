WeatherApp (AngularJS + Flask + Leaflet)
=======================================

Contents:
- frontend/
  - index.html
  - app.js
  - styles.css
- backend/
  - app.py
  - requirements.txt

Description:
- Frontend is a single-page AngularJS app using Leaflet (OpenStreetMap) for maps and leaflet.heat for heatmaps.
- Backend is a small Flask app that proxies requests to OpenWeatherMap so your API key stays on the server.

Before running:
1. Place your OpenWeatherMap API key in one of two ways:
   - Set an environment variable OWM_API_KEY before running the Flask app:
     On Windows CMD:
       set OWM_API_KEY=your_key_here
     On mac/Linux:
       export OWM_API_KEY=your_key_here
   - OR replace 'REPLACE_WITH_YOUR_OWM_API_KEY' in backend/app.py (not recommended).

2. Install backend dependencies:
   cd backend
   pip install -r requirements.txt

3. Run the backend:
   python app.py
   By default, Flask runs at http://127.0.0.1:5000

4. Serve frontend:
   Option A (recommended for CORS safety): from frontend folder run:
     python -m http.server 8000
     then open http://localhost:8000 in your browser
   Option B: Open frontend/index.html directly (may have CORS issues when calling backend)

Notes:
- Historical (timemachine) endpoint and some extended forecasts may require a paid OpenWeatherMap plan. If you get errors from the OWM API mentioning subscription, you'll need to upgrade on OWM.
- The Flask proxy keeps your OWM key hidden from the client. The frontend calls the Flask endpoints under /api/* which then call OWM.
- No Google Maps or billing required — uses OpenStreetMap (Leaflet) instead.
