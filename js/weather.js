function initWeather() {
  const API_KEY = "e5c7883f8b213eec83b18b1f3d0b3f2e";
  const BASE_URL = "https://api.openweathermap.org/data/2.5";

  /* API helpers */

  async function fetchCurrentWeather(city) {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "City not found");
    }
    return res.json();
  }

  async function fetchForecast(city) {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Forecast not available");
    }
    return res.json();
  }

  /* date/time helpers */

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDayName(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", { weekday: "long" });
  }

  function getShortDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }

  /* render helpers */

  function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  function renderCurrentWeather(data) {
    const card = document.createElement("div");
    card.className = "weather-card weather-card-main";

    const sunrise = formatTime(data.sys.sunrise);
    const sunset = formatTime(data.sys.sunset);

    card.innerHTML = `
      <div class="weather-card-header">
        <h2 class="weather-card-city">${data.name}</h2>
        <p class="weather-card-country">${data.sys.country}</p>
        <p class="weather-card-date">${formatDate(data.dt)}</p>
      </div>

      <div class="weather-card-icon-container">
        <img
          src="${getWeatherIconUrl(data.weather[0].icon)}"
          alt="${data.weather[0].description}"
          class="weather-card-icon"
        />
      </div>

      <div class="weather-card-temp">
        <div class="weather-card-temp-main">${Math.round(data.main.temp)}°C</div>
        <div class="weather-card-temp-feels">Feels like ${Math.round(data.main.feels_like)}°C</div>
      </div>

      <p class="weather-card-description">${data.weather[0].description}</p>

      <div class="weather-card-details">
        <div class="weather-detail-item">
          <span class="weather-detail-label">Humidity</span>
          <span class="weather-detail-value">${data.main.humidity}%</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Wind</span>
          <span class="weather-detail-value">${Math.round(data.wind.speed)} m/s</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Sunrise</span>
          <span class="weather-detail-value">${sunrise}</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Sunset</span>
          <span class="weather-detail-value">${sunset}</span>
        </div>
      </div>
    `;

    return card;
  }

  function renderForecastCard(item) {
    const card = document.createElement("div");
    card.className = "weather-card weather-card-forecast";

    card.innerHTML = `
      <div class="weather-card-header">
        <p class="weather-card-date">${getShortDate(item.dt)}</p>
        <p class="weather-card-day">${getDayName(item.dt)}</p>
      </div>

      <div class="weather-card-icon-container">
        <img
          src="${getWeatherIconUrl(item.weather[0].icon)}"
          alt="${item.weather[0].description}"
          class="weather-card-icon"
        />
      </div>

      <div class="weather-card-temp">
        <div class="weather-card-temp-main">${Math.round(item.main.temp)}°C</div>
        <div class="weather-card-temp-range">
          H: ${Math.round(item.main.temp_max)}° L: ${Math.round(item.main.temp_min)}°
        </div>
      </div>

      <p class="weather-card-description">${item.weather[0].description}</p>
    `;

    return card;
  }

  function renderLoading() {
    return `
      <div class="weather-loading">
        <div class="weather-loading-spinner"></div>
        <p class="weather-loading-text">Fetching weather data...</p>
      </div>
    `;
  }

  function renderError(message) {
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

    // Show loading
    container.innerHTML = renderLoading();
    showResults();

    try {
      // Fetch current weather and forecast in parallel
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city),
      ]);

      container.innerHTML = "";

      // Render current weather card
      const currentCard = renderCurrentWeather(currentData);
      container.appendChild(currentCard);

      // Get daily forecasts (one per day at noon)
      const dailyForecasts = getDailyForecasts(forecastData.list);

      // Render forecast cards
      dailyForecasts.forEach((item) => {
        const forecastCard = renderForecastCard(item);
        container.appendChild(forecastCard);
      });
    } catch (err) {
      container.innerHTML = renderError(
        err.message || "Unable to fetch weather data. Please try again.",
      );
    }
  }

  function getDailyForecasts(list) {
    // Group forecasts by day and pick noon (12:00) entry for each day
    const dailyMap = new Map();
    const today = new Date().toDateString();

    list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateString = date.toDateString();

      // Skip today
      if (dateString === today) return;

      // Prefer entries around noon (12:00)
      const hour = date.getHours();
      if (!dailyMap.has(dateString)) {
        dailyMap.set(dateString, item);
      } else {
        const existing = dailyMap.get(dateString);
        const existingHour = new Date(existing.dt * 1000).getHours();
        // Pick the one closer to noon
        if (Math.abs(hour - 12) < Math.abs(existingHour - 12)) {
          dailyMap.set(dateString, item);
        }
      }
    });

    // Return up to 4 days of forecast
    return Array.from(dailyMap.values()).slice(0, 4);
  }

  /* section toggle */

  const searchSection = document.querySelector(".weather-search-section");
  const resultsSection = document.querySelector(".weather-results-section");
  const toggleBtn = document.getElementById("weather-toggle-btn");

  let showingResults = false;

  function showResults() {
    if (!searchSection || !resultsSection || !toggleBtn) return;
    showingResults = true;
    searchSection.classList.add("slide-up");
    resultsSection.classList.add("active");
    toggleBtn.textContent = "↑";
    toggleBtn.setAttribute("aria-label", "Show search");
  }

  function showSearch() {
    if (!searchSection || !resultsSection || !toggleBtn) return;
    showingResults = false;
    searchSection.classList.remove("slide-up");
    resultsSection.classList.remove("active");
    toggleBtn.textContent = "↓";
    toggleBtn.setAttribute("aria-label", "Show results");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (showingResults) showSearch();
      else showResults();
    });
  }

  // Wheel to switch sections
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.deltaY > 20 && !showingResults) showResults();
      else if (e.deltaY < -20 && showingResults) showSearch();
    },
    { passive: true },
  );

  /* form handling */

  const weatherForm = document.getElementById("weather-form");
  const locationInput = document.getElementById("weather-location");

  if (weatherForm) {
    weatherForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = locationInput?.value?.trim();
      if (city) {
        searchWeather(city);
      }
    });
  }

}

