const map = L.map("map").setView([20, 78], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

window.addEventListener("load", () => {
  setTimeout(() => map.invalidateSize(), 400);
});

const sidebar = document.getElementById("details");

// 🧠 Change this when deploying
const BACKEND_URL = "https://weatherapp-backend-xtea.onrender.com";

async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/forecast?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch {
    return { error: "Could not connect to backend" };
  }
}

function updateSidebar(data) {
  const current = data.current;
  const forecast = data.forecast.list.slice(0, 40);

  const city = current.name;
  const cond = current.weather[0].description.toLowerCase();
  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const wind = current.wind.speed;

  // Sidebar text update
  sidebar.innerHTML = `
    <h3>${city}</h3>
    <p><b>Condition:</b> ${cond}</p>
    <p><b>Temperature:</b> ${temp}°C</p>
    <p><b>Humidity:</b> ${humidity}%</p>
    <p><b>Wind Speed:</b> ${wind} m/s</p>
    <h4>Next 5 Days Forecast & Precautions</h4>
    ${forecast
      .filter((_, i) => i % 8 === 0)
      .map(day => {
        const d = new Date(day.dt_txt);
        const weather = day.weather[0].description.toLowerCase();

        let advice = "";
        if (weather.includes("rain")) advice = "☔ Carry an umbrella and stay dry!";
        else if (weather.includes("snow")) advice = "❄️ Wear warm clothes and be cautious!";
        else if (weather.includes("clear")) advice = "☀️ Use sunscreen and stay hydrated!";
        else if (weather.includes("cloud")) advice = "🌤️ Nice cool weather outside!";
        else if (weather.includes("storm")) advice = "⚡ Avoid open areas during thunderstorms!";
        else advice = "🌈 Enjoy the day!";

        return `
          <div class="forecast">
            <b>${d.toDateString()}</b>
            <p>🌡️ ${day.main.temp}°C, 💧 ${day.main.humidity}%</p>
            <p>${weather}</p>
            <p><b>Precaution:</b> ${advice}</p>
          </div>
        `;
      })
      .join("")}
  `;

  // Apply weather effect
  createVisualEffect(cond);
  sidebarWeatherEffect(cond);
}

// 💧 Remove previous animations
function clearEffects() {
  document.querySelectorAll(".rain-drop, .snow-flake, .cloud-shape, .sunshine, .sidebar-effect").forEach(e => e.remove());
  sidebar.style.background = "rgba(0,0,0,0.85)";
}

// ☀️ Main page weather effect
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

// 🌧️ Sidebar weather effect
function sidebarWeatherEffect(condition) {
  const effectWrapper = document.createElement("div");
  effectWrapper.className = "sidebar-effect";

  // 💧 Realistic droplet effect for rain
  if (condition.includes("rain")) {
    sidebar.style.background = "linear-gradient(180deg, rgba(0,0,30,0.9), rgba(0,0,0,0.9))";
    for (let i = 0; i < 40; i++) {
      const drop = document.createElement("div");
      drop.className = "raindrop-glass";
      drop.style.left = `${Math.random() * 320}px`;
      drop.style.top = `${Math.random() * 500}px`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      effectWrapper.appendChild(drop);
    }
  }

  // ❄️ Gentle snow
  else if (condition.includes("snow")) {
    sidebar.style.background = "linear-gradient(180deg, rgba(200,200,255,0.1), rgba(0,0,0,0.8))";
    for (let i = 0; i < 15; i++) {
      const flake = document.createElement("div");
      flake.className = "snow-flake small";
      flake.style.left = `${Math.random() * 320}px`;
      flake.style.animationDuration = `${2 + Math.random() * 2}s`;
      effectWrapper.appendChild(flake);
    }
  }

  sidebar.appendChild(effectWrapper);
}


// 🗺️ Click for weather
map.on("click", async (e) => {
  sidebar.innerHTML = `<p>Fetching weather for [${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}]...</p>`;
  const data = await fetchWeather(e.latlng.lat, e.latlng.lng);
  if (data.error) sidebar.innerHTML = `<p>❌ ${data.error}</p>`;
  else updateSidebar(data);
});

// 🔍 Search
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
