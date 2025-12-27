function initTrips() {
  let currentSlide = 0;
  let carouselInterval;

  const tripDestination = localStorage.getItem("tripDestination");
  if (tripDestination) {
    const destination = document.querySelector("#route-destination");
    if (destination) destination.value = tripDestination;
    localStorage.removeItem("tripDestination");
  }

  function initCarousel() {
    const slides = document.querySelectorAll(".carousel-img");
    if (!slides.length) return;

    function showSlide(n) {
      slides.forEach((slide) => slide.classList.remove("active"));
      slides[n].classList.add("active");
      currentSlide = n;
    }

    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  // -------- generic helpers --------

  function loadTrips() {
    const raw = localStorage.getItem("tripCollections");
    return raw ? JSON.parse(raw) : [];
  }

  function saveTrips(trips) {
    localStorage.setItem("tripCollections", JSON.stringify(trips));
  }

  function setupRouteDrag(container) {
    let draggedElement = null;

    function handleDragStart(e) {
      draggedElement = this;
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }

    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();

      if (!draggedElement || draggedElement === this) return;
      if (!this.classList.contains("route-row")) return;

      const allRows = Array.from(container.querySelectorAll(".route-row"));
      const draggedIndex = allRows.indexOf(draggedElement);
      const targetIndex = allRows.indexOf(this);

      // if one of them is not found, abort safely
      if (draggedIndex === -1 || targetIndex === -1) return;

      if (draggedIndex < targetIndex) {
        container.insertBefore(draggedElement, this.nextSibling);
      } else {
        container.insertBefore(draggedElement, this);
      }

      this.classList.remove("drag-over");
    }

    function handleDragEnd() {
      this.classList.remove("dragging");
      container
        .querySelectorAll(".route-row")
        .forEach((row) => row.classList.remove("drag-over"));
      draggedElement = null;
    }

    function handleDragEnter() {
      if (this !== draggedElement && this.classList.contains("route-row")) {
        this.classList.add("drag-over");
      }
    }

    function handleDragLeave() {
      this.classList.remove("drag-over");
    }

    container.querySelectorAll(".route-row").forEach((row) => {
      row.setAttribute("draggable", "true");
      row.removeEventListener("dragstart", handleDragStart);
      row.removeEventListener("dragover", handleDragOver);
      row.removeEventListener("drop", handleDrop);
      row.removeEventListener("dragend", handleDragEnd);
      row.removeEventListener("dragenter", handleDragEnter);
      row.removeEventListener("dragleave", handleDragLeave);

      row.addEventListener("dragstart", handleDragStart);
      row.addEventListener("dragover", handleDragOver);
      row.addEventListener("drop", handleDrop);
      row.addEventListener("dragend", handleDragEnd);
      row.addEventListener("dragenter", handleDragEnter);
      row.addEventListener("dragleave", handleDragLeave);
    });
  }

  // -------- main route form --------

  function initRouteForm() {
    const routeForm = document.getElementById("route-form");
    const stopsContainer = document.getElementById("route-stops-container");
    if (!routeForm || !stopsContainer) return;

    const actionButtons = document.getElementById("action-buttons");
    const addStopBtn = actionButtons?.querySelector(".add-stop-btn");

    Array.from(stopsContainer.querySelectorAll(".route-row")).forEach((row) => {
      row.querySelector(".drag-handle")?.classList.remove("hidden");
    });
    setupRouteDrag(stopsContainer);

    function updatePlaceholdersAndButtons() {
      const rows = Array.from(stopsContainer.querySelectorAll(".route-row"));
      if (!rows.length) return;

      rows.forEach((row, index) => {
        const input = row.querySelector("input");
        if (!input) return;

        if (index === 0) {
          input.placeholder = "Where are you starting from?";
          row.dataset.type = "origin";
        } else if (index === rows.length - 1) {
          input.placeholder = "Where are you going?";
          row.dataset.type = "destination";
        } else {
          const stopIndex = index;
          input.placeholder = `Stop ${stopIndex}`;
          row.dataset.type = "stop";
        }
      });
    }

    function addAnotherStop() {
      const row = document.createElement("div");
      row.className = "route-row";

      const handle = document.createElement("span");
      handle.className = "drag-handle";
      handle.innerHTML = "⠿";

      const input = document.createElement("input");
      input.type = "text";
      input.className = "route-input";

      row.appendChild(handle);
      row.appendChild(input);
      stopsContainer.insertBefore(
        row,
        stopsContainer.querySelector(".route-destination-row"),
      );

      updatePlaceholdersAndButtons();
      setupRouteDrag(stopsContainer);
      input.focus();
    }

    addStopBtn?.addEventListener("click", addAnotherStop);

    stopsContainer
      .querySelectorAll(".route-row input")
      .forEach((input) =>
        input.addEventListener("input", updatePlaceholdersAndButtons),
      );

    updatePlaceholdersAndButtons();

    function getTripFromForm() {
      const tripTitle = document.getElementById("trip-title")?.value || "";
      const startDate = document.getElementById("trip-start-date")?.value || "";
      const endDate = document.getElementById("trip-end-date")?.value || "";

      const rows = Array.from(
        stopsContainer.querySelectorAll(".route-row input.route-input"),
      ).map((input) => input.closest(".route-row"));

      let origin = "";
      let destination = "";
      const stops = [];

      rows.forEach((row) => {
        const input = row.querySelector("input.route-input");
        const type = row.dataset.type;
        const value = input?.value?.trim() || "";

        if (!value) return;

        if (type === "origin") origin = value;
        else if (type === "destination") destination = value;
        else if (type === "stop") stops.push(value);
      });

      return {
        id: Date.now(),
        tripTitle,
        startDate,
        endDate,
        origin,
        stops,
        destination,
      };
    }

    // -------- Saved trips render --------

    function renderTrips() {
      const container = document.getElementById("saved-trips-list");
      if (!container) return;

      const trips = loadTrips();

      // order trips by start date
      trips.sort((a, b) => {
        const da = new Date(a.startDate || 0).getTime();
        const db = new Date(b.startDate || 0).getTime();
        return da - db;
      });

      container.innerHTML = "";

      trips.forEach((trip) => {
        const card = document.createElement("article");
        card.className = "trip-card";
        card.dataset.id = trip.id;

        const inner = document.createElement("div");
        inner.className = "trip-card-inner";

        // ===== FRONT =====
        const front = document.createElement("div");
        front.className = "trip-card-face";

        const toolbar = document.createElement("div");
        toolbar.className = "trip-card-toolbar";

        const editBtn = document.createElement("button");
        editBtn.className = "trip-card-btn trip-card-btn-edit";
        editBtn.type = "button";
        editBtn.setAttribute("aria-label", "Edit trip");
        editBtn.textContent = "✏️";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "trip-card-btn trip-card-btn-delete";
        deleteBtn.type = "button";
        deleteBtn.setAttribute("aria-label", "Delete trip");
        deleteBtn.textContent = "🗑️";

        toolbar.appendChild(editBtn);
        toolbar.appendChild(deleteBtn);
        front.appendChild(toolbar);

        const header = document.createElement("div");
        header.className = "trip-card-header";

        const titleEl = document.createElement("h3");
        titleEl.className = "trip-card-title";
        titleEl.textContent = trip.tripTitle || "Untitled trip";

        const datesEl = document.createElement("p");
        datesEl.className = "trip-card-dates";
        const prettyStart = formatDatePretty(trip.startDate);
        const prettyEnd = formatDatePretty(trip.endDate);
        datesEl.textContent = `${prettyStart} → ${prettyEnd}`;

        header.appendChild(titleEl);
        header.appendChild(datesEl);
        front.appendChild(header);

        const routeEl = document.createElement("div");
        routeEl.className = "trip-card-route";

        const addStopView = (label, type) => {
          if (!label) return;
          const row = document.createElement("div");
          row.className = "trip-card-stop";
          const icon = document.createElement("div");
          icon.className = `trip-card-icon trip-card-icon-${type}`;
          const text = document.createElement("div");
          text.textContent = label;
          row.appendChild(icon);
          row.appendChild(text);
          routeEl.appendChild(row);
        };

        const addArrow = () => {
          const arrow = document.createElement("div");
          arrow.className = "trip-card-arrow";
          arrow.textContent = "↓";
          routeEl.appendChild(arrow);
        };

        if (trip.origin) addStopView(trip.origin, "origin");
        if (Array.isArray(trip.stops)) {
          trip.stops.forEach((s, i) => {
            if ((trip.origin || i > 0) && s) addArrow();
            addStopView(s, "stop");
          });
        }
        if (trip.destination) {
          if (trip.origin || (trip.stops && trip.stops.length)) addArrow();
          addStopView(trip.destination, "destination");
        }

        front.appendChild(routeEl);

        // ===== BACK (edit form) =====
        const back = document.createElement("div");
        back.className = "trip-card-face trip-card-face-back";
        back.innerHTML = `
          <form class="route-form trip-card-edit-form">
            <div class="trip-meta">
              <input
                type="text"
                class="route-input trip-title-input trip-input-title"
                value="${trip.tripTitle || ""}"
                placeholder="Trip Title"
                required
              />
              <div class="trip-dates">
                <input
                  class="route-input trip-date-input trip-input-start"
                  type="date"
                  value="${trip.startDate || ""}"
                  required
                />
                <input
                  class="route-input trip-date-input trip-input-end"
                  type="date"
                  value="${trip.endDate || ""}"
                  required
                />
              </div>
            </div>

            <div class="route-stops-container-inline">
              <div class="route-row" data-type="origin">
                <span class="drag-handle">⠿</span>
                <input
                  type="text"
                  class="route-input trip-input-origin"
                  value="${trip.origin || ""}"
                  placeholder="Where are you starting from?"
                  required
                />
              </div>

              ${(trip.stops || [])
                .map(
                  (s) => `
                <div class="route-row" data-type="stop">
                  <span class="drag-handle">⠿</span>
                  <input
                    type="text"
                    class="route-input trip-input-stop"
                    value="${s}"
                    placeholder="Stop"
                  />
                </div>`,
                )
                .join("")}

              <div class="route-row" data-type="destination">
                <span class="drag-handle">⠿</span>
                <input
                  type="text"
                  class="route-input trip-input-destination"
                  value="${trip.destination || ""}"
                  placeholder="Where are you going?"
                  required
                />
              </div>
            </div>

            <div class="action-buttons trip-card-edit-actions">
              <button type="button" class="btn add-stop-btn add-stop-inline">
                + Add another stop
              </button>
              <button type="button" class="btn search-btn save-trip-inline">
                Save trip
              </button>
            </div>
          </form>
        `;

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        const confirm = document.createElement("div");
        confirm.className = "trip-card-confirm";
        confirm.innerHTML = `
          <button type="button" class="trip-card-confirm-delete">Delete</button>
          <button type="button" class="trip-card-confirm-cancel">Cancel</button>
        `;

        card.appendChild(confirm);
        container.appendChild(card);

        const confirmDeleteBtn = confirm.querySelector(
          ".trip-card-confirm-delete",
        );
        const confirmCancelBtn = confirm.querySelector(
          ".trip-card-confirm-cancel",
        );

        // ===== EVENTS =====

        editBtn.addEventListener("click", () => {
          card.classList.add("is-editing");
          const editContainer = back.querySelector(
            ".route-stops-container-inline",
          );
          setupRouteDrag(editContainer);
        });

        deleteBtn.addEventListener("click", () => {
          card.classList.add("show-confirm");
        });

        confirmCancelBtn.addEventListener("click", () => {
          card.classList.remove("show-confirm");
        });

        confirmDeleteBtn.addEventListener("click", () => {
          const arr = loadTrips().filter((t) => t.id !== trip.id);
          saveTrips(arr);
          renderTrips();
        });

        const editForm = back.querySelector(".trip-card-edit-form");
        const stopsInline = editForm.querySelector(
          ".route-stops-container-inline",
        );
        const addStopInlineBtn = editForm.querySelector(".add-stop-inline");
        const saveBtn = editForm.querySelector(".save-trip-inline");

        addStopInlineBtn.addEventListener("click", () => {
          const row = document.createElement("div");
          row.className = "route-row";
          row.dataset.type = "stop";
          row.innerHTML = `
            <span class="drag-handle">⠿</span>
            <input
              type="text"
              class="route-input trip-input-stop"
              placeholder="Stop"
            />
          `;
          stopsInline.insertBefore(
            row,
            stopsInline.querySelector('[data-type="destination"]'),
          );
          setupRouteDrag(stopsInline);
        });

        saveBtn.addEventListener("click", () => {
          const rows = Array.from(stopsInline.querySelectorAll(".route-row"));

          let origin = "";
          let destination = "";
          const stops = [];

          rows.forEach((row) => {
            const val = row.querySelector(".route-input").value.trim();
            if (!val) return;
            const type = row.dataset.type;
            if (type === "origin") origin = val;
            else if (type === "destination") destination = val;
            else stops.push(val);
          });

          const updated = {
            ...trip,
            tripTitle: editForm.querySelector(".trip-input-title").value.trim(),
            startDate: editForm.querySelector(".trip-input-start").value,
            endDate: editForm.querySelector(".trip-input-end").value,
            origin,
            destination,
            stops,
          };

          const arr = loadTrips();
          const idx = arr.findIndex((t) => t.id === trip.id);
          if (idx !== -1) arr[idx] = updated;
          saveTrips(arr);
          renderTrips();
        });
      });
    }

    routeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newTrip = getTripFromForm();
      const trips = loadTrips();
      trips.push(newTrip);
      saveTrips(trips);
      renderTrips();

      const formSection = document.querySelector(".trip-form-section");
      const collectionSection = document.querySelector(
        ".trip-collection-section",
      );
      const toggleBtn = document.getElementById("trips-toggle-btn");

      if (formSection && collectionSection && toggleBtn) {
        formSection.classList.add("slide-up");
        collectionSection.classList.add("active");
        toggleBtn.textContent = "↑";
        toggleBtn.setAttribute("aria-label", "Show form");
      }
    });

    routeForm.reset();

    renderTrips();
  }

  function formatDatePretty(iso) {
    if (!iso) return "?";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // -------- section toggle --------

  const formSection = document.querySelector(".trip-form-section");
  const collectionSection = document.querySelector(".trip-collection-section");
  const toggleBtn = document.getElementById("trips-toggle-btn");

  if (formSection && collectionSection && toggleBtn) {
    let showingCollection = false;

    function showCollection() {
      showingCollection = true;
      formSection.classList.add("slide-up");
      collectionSection.classList.add("active");
      toggleBtn.textContent = "↑";
      toggleBtn.setAttribute("aria-label", "Show form");
    }

    function showForm() {
      showingCollection = false;
      formSection.classList.remove("slide-up");
      collectionSection.classList.remove("active");
      toggleBtn.textContent = "↓";
      toggleBtn.setAttribute("aria-label", "Show saved trips");
    }

    toggleBtn.addEventListener("click", () => {
      if (showingCollection) showForm();
      else showCollection();
    });

    window.addEventListener(
      "wheel",
      (e) => {
        if (e.deltaY > 20 && !showingCollection) showCollection();
        else if (e.deltaY < -20 && showingCollection) showForm();
      },
      { passive: true },
    );
  }

  initCarousel();
  initRouteForm();
}
