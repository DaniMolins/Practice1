// ============================================
// BLOCK 1: CAROUSEL FUNCTIONALITY
// ============================================
let currentSlide = 0;
let carouselInterval;

function initCarousel() {
  const slides = document.querySelectorAll(".carousel-img");
  const indicators = document.querySelectorAll(".indicator");

  if (slides.length === 0) return;

  function showSlide(n) {
    slides.forEach((slide) => slide.classList.remove("active"));
    indicators.forEach((ind) => ind.classList.remove("active"));
    slides[n].classList.add("active");
    indicators[n].classList.add("active");
    currentSlide = n;
  }

  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5000);

  indicators.forEach((indicator) => {
    indicator.addEventListener("click", (e) => {
      clearInterval(carouselInterval);
      const slideIndex = parseInt(e.target.dataset.slide);
      showSlide(slideIndex);
      carouselInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }, 5000);
    });
  });
}

// ============================================
// BLOCK 2: ROUTE FORM INITIALIZATION
// ============================================
function initRouteForm() {
  const routeForm = document.getElementById("route-form");
  const stopsContainer = document.getElementById("route-stops-container");
  const originRow = document.querySelector(".route-origin-row");
  const destinationRow = document.querySelector(".route-destination-row");
  const originInput = document.getElementById("route-origin");
  const destinationInput = document.getElementById("route-destination");

  if (!routeForm || !stopsContainer) return;

  const typingDelay = 800;
  let stopCount = 0;
  let draggedElement = null;

  // Setup drag for origin and destination rows
  setupDragEvents(originRow);
  setupDragEvents(destinationRow);

// ============================================
// BLOCK 3: ORIGIN INPUT HANDLER
// ============================================
let originTypingTimer;

originInput.addEventListener("input", (e) => {
  clearTimeout(originTypingTimer);
  
  if (!e.target.value.trim()) {
    hideDestinationAndButtons();
    return;
  }
  
  if (destinationRow.classList.contains("hidden")) {
    originTypingTimer = setTimeout(() => {
      showDestination();
    }, typingDelay);
  }
});

// ============================================
// BLOCK 4: SHOW DESTINATION
// ============================================
function showDestination() {
  // Show destination row
  destinationRow.classList.remove("hidden");

  // Show drag handles on both origin and destination
  originRow.querySelector(".drag-handle").classList.remove("hidden");
  destinationRow.querySelector(".drag-handle").classList.remove("hidden");

  // Ensure both rows are draggable
  originRow.setAttribute("draggable", "true");
  destinationRow.setAttribute("draggable", "true");

  setTimeout(() => {
    destinationInput.focus();
  }, 100);

  let destTypingTimer;
  destinationInput.addEventListener("input", (e) => {
    clearTimeout(destTypingTimer);
    if (e.target.value.trim()) {
      destTypingTimer = setTimeout(() => {
        showActionButtons();
      }, typingDelay);
    }
  });
}


  // ============================================
  // BLOCK 5: HIDE DESTINATION AND BUTTONS
  // ============================================
  function hideDestinationAndButtons() {
    destinationRow.classList.add("hidden");
    destinationRow.querySelector(".drag-handle").classList.add("hidden");
    destinationInput.value = "";
    
    // Remove all stop rows
    const stopRows = stopsContainer.querySelectorAll('[data-type="stop"]');
    stopRows.forEach(row => row.remove());
    stopCount = 0;

    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) actionButtons.remove();

    // Hide origin drag handle
    originRow.querySelector(".drag-handle").classList.add("hidden");
  }

  // ============================================
  // BLOCK 6: SHOW ACTION BUTTONS
  // ============================================
  function showActionButtons() {
    if (document.getElementById("action-buttons")) return;

    // Show drag handles when we have at least 2 inputs
    originRow.querySelector(".drag-handle").classList.remove("hidden");

    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "action-buttons";
    buttonsContainer.className = "action-buttons";

    const searchBtn = document.createElement("button");
    searchBtn.type = "submit";
    searchBtn.className = "btn search-btn";
    searchBtn.textContent = "Search trips";

    const addStopBtn = document.createElement("button");
    addStopBtn.type = "button";
    addStopBtn.className = "btn add-stop-btn";
    addStopBtn.textContent = "+ Add another stop";

    buttonsContainer.appendChild(searchBtn);
    buttonsContainer.appendChild(addStopBtn);
    routeForm.appendChild(buttonsContainer);

    addStopBtn.addEventListener("click", () => {
      addAnotherStop();
    });
  }

  // ============================================
  // BLOCK 7: ADD ANOTHER STOP
  // ============================================
  function addAnotherStop() {
    stopCount++;
    const stopRow = createStopRow(stopCount);

    // Insert before destination row
    stopsContainer.insertBefore(stopRow, destinationRow);

    stopRow.querySelector("input").focus();
  }

  // ============================================
  // BLOCK 8: CREATE STOP ROW
  // ============================================
  function createStopRow(number) {
    const row = document.createElement("div");
    row.className = "route-row";
    row.setAttribute("data-type", "stop");
    row.setAttribute("draggable", "true");

    const handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.innerHTML = "⠿";
    handle.setAttribute("draggable", "true");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "route-input";
    input.placeholder = `Stop ${number}`;
    input.setAttribute("name", `stop-${number}`);

    row.appendChild(handle);
    row.appendChild(input);

    setupDragEvents(row);

    return row;
  }

  // ============================================
  // BLOCK 9: DRAG AND DROP SETUP
  // ============================================
  function setupDragEvents(row) {
    row.addEventListener("dragstart", handleDragStart);
    row.addEventListener("dragover", handleDragOver);
    row.addEventListener("drop", handleDrop);
    row.addEventListener("dragend", handleDragEnd);
    row.addEventListener("dragenter", handleDragEnter);
    row.addEventListener("dragleave", handleDragLeave);
  }

  function handleDragStart(e) {
    draggedElement = this;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  }

  function handleDragEnter(e) {
    if (this !== draggedElement && this.classList.contains("route-row") && !this.classList.contains("hidden")) {
      this.classList.add("drag-over");
    }
  }

  function handleDragLeave(e) {
    this.classList.remove("drag-over");
  }

  function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();

    if (draggedElement !== this && this.classList.contains("route-row") && !this.classList.contains("hidden")) {
      const allVisibleRows = Array.from(stopsContainer.querySelectorAll(".route-row:not(.hidden)"));
      const draggedIndex = allVisibleRows.indexOf(draggedElement);
      const targetIndex = allVisibleRows.indexOf(this);

      if (draggedIndex < targetIndex) {
        this.parentNode.insertBefore(draggedElement, this.nextSibling);
      } else {
        this.parentNode.insertBefore(draggedElement, this);
      }
    }

    this.classList.remove("drag-over");
    return false;
  }

  function handleDragEnd(e) {
    this.classList.remove("dragging");
    
    const allRows = stopsContainer.querySelectorAll(".route-row");
    allRows.forEach(row => row.classList.remove("drag-over"));
  }



  // ============================================
  //  FORM SUBMISSION
  // ============================================
  routeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();
    
    const stops = Array.from(stopsContainer.querySelectorAll('[data-type="stop"] input'))
      .map(input => input.value.trim())
      .filter(val => val);
    
    if (origin && destination) {
      console.log("Route:", { origin, stops, destination });
      alert(`Searching: ${origin} → ${stops.join(" → ")} → ${destination}`);
      // window.location.href = "?page=trips";
    }
  });
}

// ============================================
// INITIALIZE HOME PAGE
// ============================================
window.initHome = function () {
  initCarousel();
  initRouteForm();
};
