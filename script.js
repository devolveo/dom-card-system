// DOM Element references
let cardsContainer;
let form;
let searchInput;
let filterSelect;

// Application State
let cards = [
  {
    id: 1,
    title: "Learn DOM Manipulation",
    description: "Master the fundamentals of DOM",
    category: "study",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Build a Project",
    description: "Apply knowledge in real project",
    category: "work",
    createdAt: new Date().toISOString(),
  },
];

let nextId = 3; // For generating unique IDs

console.log("Initial cards loaded: ", cards);

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  // Get all elements
  cardsContainer = document.querySelector("#cards-container");
  form = document.querySelector("#create-card-form");
  searchInput = document.querySelector("#search-input");
  filterSelect = document.querySelector("#filter-category");

  // Check if we found them
  console.log("Cards container: ", cardsContainer);
  console.log("Form: ", form);
  console.log("Search input: ", searchInput);
  console.log("Filter select: ", filterSelect);

  if (!cardsContainer) {
    console.error("Could not find #cards-container element!");
    return;
  }

  // Try to load saved cards
  if (!loadCards()) {
    // If no saved cards, use the defaults
    console.log("Using default cards");
  }

  // Initial render
  renderCards();

  // Setup event listeners
  setupEventListeners();
});

// PITER Method: renderCards (Hybrid Approach)
function renderCards(cardsToRender = null) {
  const displayCards = cardsToRender || getFilteredCards();

  console.log("renderCards called with: ", displayCards);

  if (!Array.isArray(displayCards)) {
    console.error("renderCards: Invalid cards data");
    return;
  }

  if (!cardsContainer) {
    console.error("renderCards: Cards container not found");
    return;
  }

  if (displayCards.length === 0) {
    cardsContainer.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; color:#999;">
      <p>No cards yet. Create your first card!</p>
    </div>
    `;
    return;
  }

  const cardsHTML = displayCards
    .map(
      (card) => `
      <div class="card" data-card-id="${card.id}">
        <button class="delete-btn" aria-label="Delete card">×</button>
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <span class="category category-${card.category}">${card.category}</span>
      </div>
    `
    )
    .join("");

  cardsContainer.innerHTML = cardsHTML;

  console.log(`renderCards: Rendered ${displayCards.length} cards`);
}

// PITER Method: getFilteredCards
function getFilteredCards() {
  console.log("Filtering cards");

  const searchTerm = searchInput?.value.toLowerCase() || "";
  const category = filterSelect?.value || "all";

  console.log("Search term:", searchTerm);
  console.log("Category filter:", category);

  const filtered = cards.filter((card) => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchTerm) ||
      card.description.toLowerCase().includes(searchTerm);

    const matchesCategory = category === "all" || card.category === category;

    return matchesSearch && matchesCategory;
  });

  console.log(`Filtered ${filtered.length} of ${cards.length} cards`);
  return filtered;
}

// PITER Method: setupEventListeners
function setupEventListeners() {
  console.log("Setting up event listeners");

  if (!cardsContainer) {
    console.error("setupEventListeners: Cards container not found");
    return;
  }

  if (form) {
    form.addEventListener("submit", handleCreateCard);
    console.log("Form listener attached");
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
    console.log("Search listener attached");
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", handleFilter);
    console.log("Filter listener attached");
  }

  cardsContainer.addEventListener("click", handleCardClick);

  console.log("Event listeners attached");
}

// PITER Method: handleCardClick
function handleCardClick(event) {
  console.log("Card container clicked:", event.target);

  if (!event || !event.target) {
    console.error("handleCardClick: Invalid event");
    return;
  }

  const deleteBtn = event.target.closest(".delete-btn");
  if (deleteBtn) {
    const card = deleteBtn.closest(".card");
    if (card) {
      const cardId = parseInt(card.dataset.cardId);
      deleteCard(cardId);
    }
  }
}

// PITER Method: deleteCard (with animation)
function deleteCard(cardId) {
  console.log("deleteCard called with ID:", cardId);

  if (!cardId || typeof cardId !== "number") {
    console.error("deleteCard: Invalid card ID");
    return false;
  }

  const cardExists = cards.some((card) => card.id === cardId);
  if (!cardExists) {
    console.warn("deleteCard: Card not found:", cardId);
    return false;
  }

  const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
  if (cardElement) {
    cardElement.classList.add("card-exit");

    cardElement.addEventListener(
      "animationend",
      () => {
        cards = cards.filter((card) => card.id !== cardId);
        saveCards();
        renderCards();
        console.log("deleteCard: Successfully removed card:", cardId);
      },
      { once: true }
    );
  } else {
    cards = cards.filter((card) => card.id !== cardId);
    saveCards();
    renderCards();
    console.log("deleteCard: Successfully removed card:", cardId);
  }

  return true;
}

// PITER Method: handleCreateCard
function handleCreateCard(event) {
  console.log("Form submitted");

  if (!event) {
    console.error("handleCreateCard: No event object");
    return;
  }

  event.preventDefault();

  const formData = new FormData(event.target);
  const title = formData.get("title")?.trim();
  const description = formData.get("description")?.trim();
  const category = formData.get("category");

  if (!title || !description || !category) {
    console.error("handleCreateCard: Missing required fields");
    alert("Please fill in all fields");
    return;
  }

  const newCard = {
    id: nextId++,
    title: title,
    description: description,
    category: category,
    createdAt: new Date().toISOString(),
  };

  cards.unshift(newCard);
  saveCards();

  event.target.reset();
  renderCards();

  event.target.querySelector('[name="title"]').focus();

  console.log("Card created:", newCard);
}

// Simple handlers
function handleSearch() {
  console.log("Search triggered");
  renderCards();
}

function handleFilter() {
  console.log("Filter changed");
  renderCards();
}

// PITER Method: saveCards
function saveCards() {
  console.log("Saving cards to localStorage");

  try {
    const cardsJSON = JSON.stringify(cards);
    localStorage.setItem("cards", cardsJSON);
    console.log(`Saved ${cards.length} cards`);
    return true;
  } catch (error) {
    console.error("saveCards: Failed to save", error);
    if (error.name === "QuotaExceededError") {
      alert("Storage is full. Please delete some cards.");
    }
    return false;
  }
}

// PITER Method: loadCards
function loadCards() {
  console.log("Loading cards from localStorage");

  try {
    const cardsJSON = localStorage.getItem("cards");

    if (!cardsJSON) {
      console.log("No saved cards found");
      return false;
    }

    const savedCards = JSON.parse(cardsJSON);

    if (!Array.isArray(savedCards)) {
      console.error("loadCards: Invalid data format");
      return false;
    }

    cards = savedCards;

    if (cards.length > 0) {
      const maxId = Math.max(...cards.map((card) => card.id));
      nextId = maxId + 1;
    }

    console.log(`Loaded ${cards.length} cards`);
    return true;
  } catch (error) {
    console.error("loadCards: Failed to load", error);
    return false;
  }
}
