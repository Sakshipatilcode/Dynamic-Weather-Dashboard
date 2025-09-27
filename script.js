const apiKey = "3b132e8bf014ee3675682c8faad90def";  

// Auto-fetch weather on page load using geolocation
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log("📍 Your location:", lat, lon);
        getWeatherByCoords(lat, lon);
      },
      error => {
        console.error("Geolocation error:", error);
        document.getElementById("weatherCard").innerHTML =
          `<p style="color:red;">Location access denied. Please search manually.</p>`;
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
};

// Fetch by city (manual search)
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name!");
    return;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetchWeather(url, city);
}

// Fetch by latitude & longitude
async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetchWeather(url, null, { lat, lon});
}

async function fetchWeather(url, city = null, coords = null) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather data not found!");

    const data = await response.json();
    displayWeather(data);

    // Fetch forecast
    let forecastUrl;
    if (coords) {
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;
    } else if (city) {
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    }

    if (forecastUrl) {
      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();
      displayForecast(forecastData);
    }

  } catch (error) {
    document.getElementById("weatherCard").innerHTML =
      `<p style="color:red;">${error.message}</p>`;
  }
}
async function displayWeather(data) {
  const icon = data.weather[0].icon; 
  const condition = data.weather[0].description.toLowerCase();
  const city = data.name;

  const weatherCard = document.getElementById("weatherCard");
  weatherCard.classList.add("weather-card");

  // --- NEW: Fetch Unsplash Background ---
  const unsplashKey = "gV8rmpoq6_wCVvu2KxMU9K7GH8QCFJak0pVMqVTXw-Y";  // replace with your key
  try {
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${city} ${condition}&orientation=landscape&client_id=${unsplashKey}`;
    const res = await fetch(unsplashUrl);
    const imgData = await res.json();

    if (imgData.results.length > 0) {
      const bgUrl = imgData.results[0].urls.full;
      document.body.style.background = `url(${bgUrl}) no-repeat center center fixed`;
      document.body.style.backgroundSize = "cover";
    } else {
      console.log("No image found, keeping default background");
    }
  } catch (error) {
    console.error("Unsplash fetch error:", error);
  }

  // --- Weather Card Display ---
  weatherCard.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
    <p class="temp">🌡 ${data.main.temp}°C</p>
    <p>${data.weather[0].description}</p>
    <div class="extra-info">
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌬 Wind: ${data.wind.speed} m/s</p>
    </div>
  `;
}
// Function to display 5-day forecast
function displayForecast(forecastData) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = ""; // clear old data

  // Pick one forecast per day (12:00 PM)
  const daily = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

  daily.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    const icon = day.weather[0].icon;
    const temp = day.main.temp.toFixed(1);

    const card = `
      <div class="forecast-card">
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
        <p>${temp}°C</p>
        <p>${day.weather[0].main}</p>
      </div>
    `;

    forecastContainer.innerHTML += card;
  });
}