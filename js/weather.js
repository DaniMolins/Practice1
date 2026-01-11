function initWeather() {
   const BASE_URL = "https://api.openweathermap.org/data/2.5";
   const API_KEY = CONFIG.WEATHER_API_KEY;

  /* API functions */

  async function fetchCurrentWeather(city) {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "City not found");
    }
    return res.json();
  }

  /* helper functions */

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }

  /* show functions */

  function showWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  function getCurrentWeather(data) {
    const card = document.createElement("div");
    card.className = "weather-card";

    card.innerHTML = `
      <p class="weather-card-date">${formatDate(data.dt)}</p>

      <div class="weather-card-icon-container">
        <img
          src="${showWeatherIconUrl(data.weather[0].icon)}"
          alt="${data.weather[0].description}"
          class="weather-card-icon"
        />
      </div>

      <div class="weather-card-temp">
        <div class="weather-card-temp-main">${data.main.temp}°C</div>
      </div>

      <p class="weather-card-description">${data.weather[0].description}</p>
    `;

    return card;
  }

  function showLoading() {
    return `
      <div class="weather-loading">
        <div class="weather-loading-spinner"></div>
        <p class="weather-loading-text">Fetching weather data...</p>
      </div>
    `;
  }

  function showError(message) {
    return `
      <div class="weather-error">
        <div class="weather-error-icon">⚠️</div>
        <h3 class="weather-error-title">Oops!</h3>
        <p class="weather-error-message">${message}</p>
      </div>
    `;
  }

  /* main weather logic */

async function searchWeather(city) {
  const container = document.getElementById("weather-results-container");
  if (!container) return;

  container.innerHTML = showLoading();

  try {
    const currentData = await fetchCurrentWeather(city);
    container.innerHTML = "";

    const currentCard = getCurrentWeather(currentData);
    container.appendChild(currentCard);
  } catch (err) {
    container.innerHTML = showError(
      err.message || "Unable to fetch weather data. Please try again.",
    );
  }
}

  /* form handling */

  const weatherForm = document.getElementById("weather-form");
  const locationInput = document.getElementById("weather-location");

  if (weatherForm) {
    weatherForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = locationInput?.value?.trim();
      searchWeather(city);
    });
  }

}
