const map = L.map("map").setView([20, 78], 4);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

const sidebar = document.getElementById("details");

// 🌐 Your backend URL (replace this with your Render backend link)
const BACKEND_URL = "https://weatherapp-backend-xxxx.onrender.com";

async function fetchWeather(lat, lon) {
  const res = await fetch(`${BACKEND_URL}/api/forecast?lat=${lat}&lon=${lon}`);
  return await res.json();
}

function updateSidebar(data) {
  const current = data.current;
  const forecast = data.forecast.list.slice(0, 40);

  const city = current.name;
  const cond = current.weather[0].description;
  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const wind = current.wind.speed;

  sidebar.innerHTML = `
    <h3>${city}</h3>
    <p><b>Condition:</b> ${cond}</p>
    <p><b>Temperature:</b> ${temp}°C</p>
    <p><b>Humidity:</b> ${humidity}%</p>
    <p><b>Wind Speed:</b> ${wind} m/s</p>
    <h4>Next 5 Days Forecast</h4>
    ${forecast
      .filter((_, i) => i % 8 === 0)
      .map(day => {
        const d = new Date(day.dt_txt);
        const weather = day.weather[0].description;
        const advice =
          weather.includes("rain") ? "☔ Carry an umbrella!" :
          weather.includes("snow") ? "❄️ Wear warm clothes!" :
          weather.includes("clear") ? "😎 Stay hydrated!" :
          "🌤️ Enjoy the weather!";
        return `
          <div class="forecast">
            <b>${d.toDateString()}</b>
            <p>🌡️ ${day.main.temp}°C, 💧 ${day.main.humidity}%</p>
            <p>${weather}</p>
            <p>${advice}</p>
          </div>
        `;
      })
      .join("")}
  `;

  createVisualEffect(cond);
}

function clearEffects() {
  document.querySelectorAll(".rain-drop, .snow-flake, .cloud-shape, .sunshine").forEach(e => e.remove());
}

function createVisualEffect(condition) {
  clearEffects();

  if (condition.includes("rain")) {
    for (let i = 0; i < 80; i++) {
      const drop = document.createElement("div");
      drop.className = "rain-drop";
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.animationDuration = `${0.5 + Math.random()}s`;
      document.body.appendChild(drop);
    }
  } else if (condition.includes("snow")) {
    for (let i = 0; i < 50; i++) {
      const flake = document.createElement("div");
      flake.className = "snow-flake";
      flake.style.left = `${Math.random() * 100}vw`;
      flake.style.animationDuration = `${2 + Math.random() * 3}s`;
      document.body.appendChild(flake);
    }
  } else if (condition.includes("clear")) {
    const sun = document.createElement("div");
    sun.className = "sunshine";
    document.body.appendChild(sun);
  } else if (condition.includes("cloud")) {
    for (let i = 0; i < 3; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud-shape";
      cloud.style.top = `${50 + i * 100}px`;
      cloud.style.left = `${Math.random() * 80}vw`;
      document.body.appendChild(cloud);
    }
  }
}

map.on("click", async (e) => {
  sidebar.innerHTML = `<p>Fetching weather for [${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}]...</p>`;
  const data = await fetchWeather(e.latlng.lat, e.latlng.lng);
  if (data.error) sidebar.innerHTML = `<p>❌ ${data.error}</p>`;
  else updateSidebar(data);
});

document.getElementById("search-btn").addEventListener("click", async () => {
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;

  const geoRes = await fetch(`${BACKEND_URL}/api/geocode?city=${city}`);
  const geoData = await geoRes.json();

  if (!geoData.length) {
    sidebar.innerHTML = `<p>❌ City not found</p>`;
    return;
  }

  const { lat, lon } = geoData[0];
  map.setView([lat, lon], 8);
  const data = await fetchWeather(lat, lon);
  if (data.error) sidebar.innerHTML = `<p>❌ ${data.error}</p>`;
  else updateSidebar(data);
});
