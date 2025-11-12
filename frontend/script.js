const map = L.map("map", { zoomControl: true }).setView([13.0827, 80.2707], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  tileSize: 256,
  detectRetina: true,
}).addTo(map);

const sidebar = document.getElementById("details");
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
let weatherType = null;
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
async function fetchWeather(lat, lon) {
  const res = await fetch(`http://127.0.0.1:5000/api/forecast?lat=${lat}&lon=${lon}`);
  return res.json();
}
function getPrecautions(condition) {
  const lower = condition.toLowerCase();
  if (lower.includes("rain")) return "☂ Carry an umbrella and wear waterproof shoes.";
  if (lower.includes("clear")) return "😎 Stay hydrated and wear sunglasses.";
  if (lower.includes("storm")) return "⚡ Avoid open areas or tall trees during thunderstorms.";
  if (lower.includes("snow")) return "🧥 Dress warmly and drive carefully.";
  if (lower.includes("mist") || lower.includes("fog")) return "🚗 Turn on fog lights and reduce speed.";
  return "🌍 Enjoy your day and stay aware of changing conditions.";
}
function createParticles(type) {
  particles = [];
  weatherType = type;
  const count = type === "rain" ? 300 : 100;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 20 + 10,
      speed: Math.random() * 4 + 2,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(173,216,230,0.7)";
  ctx.lineWidth = 2;

  particles.forEach(p => {
    if (weatherType === "rain") {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.len);
      ctx.stroke();
      p.y += p.speed;
      if (p.y > canvas.height) p.y = 0;
    }
  });

  requestAnimationFrame(drawParticles);
}
function updateSidebar(data) {
  const current = data.current;
  const forecast = data.forecast.list.slice(0, 10);
  const condition = current.weather[0].main;

  sidebar.innerHTML = `
    <h3>${current.name}</h3>
    <p><b>Now:</b> ${current.main.temp}°C, ${condition}</p>
    <p><b>Humidity:</b> ${current.main.humidity}%</p>
    <p><b>Wind:</b> ${current.wind.speed} m/s</p>
    <p><b>Precautions:</b> ${getPrecautions(condition)}</p>
    <h4>10-Day Forecast</h4>
    ${forecast
      .map(
        (f) => `
        <div class="forecast">
          <b>${new Date(f.dt_txt).toDateString()}</b><br>
          🌡 ${f.main.temp}°C | ${f.weather[0].main}
        </div>
      `
      )
      .join("")}
  `;

  if (condition.toLowerCase().includes("rain")) createParticles("rain");
  else particles = [];
}
map.on("click", async (e) => {
  sidebar.innerHTML = `<p>Fetching weather for [${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}]...</p>`;
  
  const data = await fetchWeather(e.latlng.lat, e.latlng.lng);

  if (data.error) {
    sidebar.innerHTML = `<p>❌ ${data.error}</p>`;
    removeWeatherEffects();
  } else {
    updateSidebar(data);
    const currentWeather = data.current?.weather?.[0]?.main;
    if (currentWeather) {
      showWeatherEffect(currentWeather);
    }
  }
});
drawParticles();
function showWeatherEffect(weatherMain) {
  removeWeatherEffects();

  const effect = document.createElement("div");
  effect.id = "weather-effect";
  document.body.appendChild(effect);

  switch (weatherMain.toLowerCase()) {
    case "rain":
    case "drizzle":
      effect.classList.add("rain");
      break;
    case "thunderstorm":
      effect.classList.add("thunder");
      break;
    case "snow":
      effect.classList.add("snow");
      break;
    case "clouds":
      effect.classList.add("clouds");
      break;
    case "clear":
      effect.classList.add("sunny");
      break;
    default:
      break;
  }
}
function removeWeatherEffects() {
  const old = document.getElementById("weather-effect");
  if (old) old.remove();
}

