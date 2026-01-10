function initHome() {
  const form = document.getElementById("route-form");
  const input = document.getElementById("route-destination");
  const exploreBtn = document.querySelector(".btn-explore");
  const wrapper = document.querySelector(".input-wrapper");

  // Section toggle removed - now using normal scrolling

  // existing explore‑button logic
  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const hasContent = input.value.trim().length > 0;

    if (hasContent) {
      debounceTimer = setTimeout(() => {
        exploreBtn.classList.add("show");
        wrapper.classList.add("has-content");
      }, 1000);
    } else {
      exploreBtn.classList.remove("show");
      wrapper.classList.remove("has-content");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const destination = input.value.trim();
    localStorage.setItem("tripDestination", destination);
    window.location.href = "?page=trips";
  });
}
