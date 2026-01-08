const root = document.getElementById("page-root");
const titleEl = document.getElementById("page-title");
const pageStylesLink = document.getElementById("page-styles");

async function loadPage(page) {
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error("Page not found");
    const html = await res.text();
    root.innerHTML = html;
    titleEl.textContent = `TripPlanner+ · ${capitalize(page)}`;

    pageStylesLink.href = `css/${page}.css`;

    initPageScripts(page);
  } catch (err) {
    root.innerHTML = "<p>Page not found.</p>";
    console.error(err);
  }
}

function initPageScripts(page) {
  if (page === "home" && typeof initHome === "function") {
    initHome();
  } else if (page === "trips" && typeof initTrips === "function") {
    initTrips();
  } else if (page === "weather" && typeof initWeather === "function") {
    initWeather();
  } else if (page === "about" && typeof initAbout === "function") {
    initAbout();
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("page") || "home";
}

window.addEventListener("DOMContentLoaded", () => {
  const page = getPageFromURL();
  loadPage(page);
});

// Update nav active state on page change
window.addEventListener("load", updateNavActive);
function updateNavActive() {
  document.querySelectorAll(".nav-left a").forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    const pageParam = new URLSearchParams(href.split("?")[1]).get("page");
    const currentPage = getPageFromURL();
    if (pageParam === currentPage) {
      link.classList.add("active");
    }
  });
}
