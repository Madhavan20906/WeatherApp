const apiKey = "YOUR_API_KEY"; // <-- put your OpenWeatherMap API key here
const map = L.map("map").setView([13.0827, 80.2707], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const detailsDiv = document.getElementById("details");

document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) getWeather(city);
});

async function getWeather(city) {
  try {
    // Get city coordinates first
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();
    if (!geoData.length) throw new Error("City not found");

    const { lat, lon } = geoData[0];
    map.setView([lat, lon], 10);

    // Current weather
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();

    // 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();

    showWeather(data, forecastData);
  } catch (err) {
    detailsDiv.innerHTML = `<p style="color:red;">Weather unavailable for "${city}"</p>`;
  }
}

function showWeather(current, forecast) {
  const name = current.name;
  const temp = current.main.temp.toFixed(1);
  const weather = current.weather[0].main;
  const icon = current.weather[0].icon;
  const humidity = current.main.humidity;
  const wind = current.wind.speed;

  // Add marker with popup
  L.marker([current.coord.lat, current.coord.lon])
    .addTo(map)
    .bindPopup(`<b>${name}</b><br>${temp}°C, ${weather}`)
    .openPopup();

  // Group 5-day forecast by day (12:00 readings)
  const days = forecast.list.filter((f) => f.dt_txt.includes("12:00:00"));

  let forecastHTML = days
    .map(
      (d) => `
      <div class="weather-day">
        <h4>${new Date(d.dt_txt).toDateString()}</h4>
        <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png"/>
        <p>${d.main.temp.toFixed(1)}°C</p>
        <p>${d.weather[0].description}</p>
        <p>Humidity: ${d.main.humidity}%</p>
        <p>Wind: ${d.wind.speed} m/s</p>
      </div>`
    )
    .join("");

  detailsDiv.innerHTML = `
    <h3>${name}</h3>
    <p><b>${weather}</b></p>
    <p>Temperature: ${temp}°C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${wind} m/s</p>
    <h3>Next 5 Days Forecast</h3>
    ${forecastHTML}
  `;

  // Background weather effects 🌧️☀️☁️
  applyWeatherEffect(weather);
}

function applyWeatherEffect(weather) {
  const body = document.body;
  body.style.background = "#0b0c10";
  const existingCanvas = document.querySelector("canvas");
  if (existingCanvas) existingCanvas.remove();

  if (weather.includes("Rain")) {
    createRainEffect();
  } else if (weather.includes("Cloud")) {
    body.style.background = "linear-gradient(#4e5d6c, #1c1e22)";
  } else if (weather.includes("Clear")) {
    body.style.background = "linear-gradient(#87ceeb, #f0e68c)";
  }
}

function createRainEffect() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const drops = Array(300).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    length: Math.random() * 20,
    speed: Math.random() * 3 + 2,
  }));

  function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(174,194,224,0.5)";
    ctx.lineWidth = 1;
    for (let drop of drops) {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    }
    moveRain();
  }

  function moveRain() {
    for (let drop of drops) {
      drop.y += drop.speed;
      if (drop.y > canvas.height) drop.y = 0;
    }
  }

  function loop() {
    drawRain();
    requestAnimationFrame(loop);
  }
  loop();
}
