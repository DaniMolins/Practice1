function initHome() {
  const form = document.getElementById("route-form");
  const input = document.getElementById("route-destination");
  const exploreBtn = document.querySelector(".btn-explore");
  const wrapper = document.querySelector(".input-wrapper");

  const hero = document.getElementById("home-main");
  const cardsSection = document.getElementById("home-cards");
  const toggleBtn = document.getElementById("home-toggle-btn");

  let showingCards = false;
  let animating = false;

  function showCards() {
    if (showingCards || animating) return;
    showingCards = true;
    animating = true;

    hero.classList.add("slide-up");
    hero.classList.remove("active");
    cardsSection.classList.add("active");

    toggleBtn.textContent = "↑";
    toggleBtn.setAttribute("aria-label", "Back to search");

    setTimeout(() => {
      animating = false;
    }, 650);
  }

  function showHero() {
    if (!showingCards || animating) return;
    showingCards = false;
    animating = true;

    hero.classList.add("active");
    hero.classList.remove("slide-up");
    cardsSection.classList.remove("active");

    toggleBtn.textContent = "↓";
    toggleBtn.setAttribute("aria-label", "Show more");

    setTimeout(() => {
      animating = false;
    }, 650);
  }

  toggleBtn.addEventListener("click", () => {
    if (showingCards) showHero();
    else showCards();
  });

  // Wheel to switch: down -> cards, up -> hero
  window.addEventListener(
    "wheel",
    (e) => {
      if (animating) return;
      if (e.deltaY > 20 && !showingCards) {
        showCards();
      } else if (e.deltaY < -20 && showingCards) {
        showHero();
      }
    },
    { passive: true },
  );

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
    if (destination) {
      localStorage.setItem("tripDestination", destination);
      window.location.href = "?page=trips";
    }
  });
}
