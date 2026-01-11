function initHome() {
  const form = document.getElementById("route-form");
  const input = document.getElementById("route-destination");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const destination = input.value.trim();
    if (destination) {
      localStorage.setItem("tripDestination", destination);
    }
    window.location.href = "?page=trips";
  });
}
