const demoHabits = [
  { id: 1, name: "Drink water", emoji: "💧", streak: 12, done: true },
  { id: 2, name: "Read 20 pages", emoji: "📚", streak: 7, done: true },
  { id: 3, name: "Morning run", emoji: "🏃", streak: 4, done: false },
  { id: 4, name: "Meditate", emoji: "🧘", streak: 3, done: true },
  { id: 5, name: "Code for 1 hour", emoji: "💻", streak: 3, done: false }
];

const weekData = [
  { day: "Sun", value: 100 },
  { day: "Mon", value: 80 },
  { day: "Tue", value: 80 },
  { day: "Wed", value: 80 },
  { day: "Thu", value: 100 },
  { day: "Fri", value: 100 },
  { day: "Sat", value: 60 }
];

const quotes = [
  ["A successful man is one who can lay a firm foundation with the bricks others have thrown at him.", "David Brinkley"],
  ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Aristotle"],
  ["The secret of getting ahead is getting started.", "Mark Twain"]
];

let habits = loadHabits();
let activeFilter = "all";
let selectedEmoji = "💧";

function loadHabits() {
  try {
    const saved = JSON.parse(localStorage.getItem("habitly-habits"));
    return Array.isArray(saved) ? saved : structuredClone(demoHabits);
  } catch {
    return structuredClone(demoHabits);
  }
}

function saveHabits() {
  localStorage.setItem("habitly-habits", JSON.stringify(habits));
}

function setDate() {
  const now = new Date();
  document.getElementById("today").textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function setQuote() {
  const day = new Date().getDate();
  const quote = quotes[day % quotes.length];
  document.getElementById("quote").textContent = `“${quote[0]}”`;
  document.getElementById("quoteAuthor").textContent = `— ${quote[1]}`;
}

function renderWeek() {
  const chart = document.getElementById("weekChart");
  chart.innerHTML = weekData.map((item) => `
    <div class="day">
      <span class="day-value">${item.value}%</span>
      <div class="day-bar${item.day === "Sat" ? " accent" : ""}" style="height:${item.value * 1.38}px"></div>
      <span class="day-name">${item.day}</span>
    </div>
  `).join("");
}

function updateStats() {
  const done = habits.filter((habit) => habit.done).length;
  const best = habits.length ? Math.max(...habits.map((habit) => habit.streak)) : 0;
  document.getElementById("doneCount").textContent = `${done}/${habits.length}`;
  document.getElementById("bestStreak").textContent = `${best} days`;
  const total = weekData.reduce((sum, item) => sum + item.value, 0);
  document.getElementById("weekRate").textContent = `${Math.round(total / weekData.length)}%`;
}

function renderHabits() {
  const list = document.getElementById("habitList");
  const visible = habits.filter((habit) => {
    if (activeFilter === "done") return habit.done;
    if (activeFilter === "pending") return !habit.done;
    return true;
  });

  if (!visible.length) {
    list.innerHTML = `<div class="empty-state">${habits.length ? "No habits match this filter." : "No habits yet"}</div>`;
    updateStats();
    return;
  }

  list.innerHTML = visible.map((habit) => `
    <article class="habit-card${habit.done ? " done" : ""}">
      <div class="habit-emoji">${habit.emoji}</div>
      <div class="habit-info">
        <h3>${escapeHtml(habit.name)}</h3>
        <p class="streak">🔥 ${habit.streak} day streak</p>
      </div>
      <div class="habit-actions">
        <button class="delete-button" type="button" data-delete="${habit.id}" aria-label="Delete ${escapeHtml(habit.name)}">🗑️</button>
        <button class="complete-button${habit.done ? " is-done" : ""}" type="button" data-toggle="${habit.id}" aria-label="${habit.done ? "Mark" : "Complete"} ${escapeHtml(habit.name)} ${habit.done ? "as pending" : "today"}">
          <span>✓</span>
          <span>${habit.done ? "Done today" : "Mark as done"}</span>
        </button>
      </div>
    </article>
  `).join("");
  updateStats();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

document.getElementById("habitForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("habitName");
  const message = document.getElementById("formMessage");
  const name = input.value.trim();
  if (!name) {
    message.textContent = "Please enter a habit name.";
    input.focus();
    return;
  }
  habits.unshift({ id: Date.now(), name, emoji: selectedEmoji, streak: 0, done: false });
  input.value = "";
  message.textContent = "";
  saveHabits();
  renderHabits();
});

document.querySelector(".emoji-picker").addEventListener("click", (event) => {
  const button = event.target.closest(".emoji-button");
  if (!button) return;
  selectedEmoji = button.dataset.emoji;
  document.querySelectorAll(".emoji-button").forEach((item) => {
    item.classList.remove("selected");
    item.setAttribute("aria-pressed", "false");
  });
  button.classList.add("selected");
  button.setAttribute("aria-pressed", "true");
});

document.getElementById("habitList").addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle]");
  const remove = event.target.closest("[data-delete]");
  if (toggle) {
    const habit = habits.find((item) => item.id === Number(toggle.dataset.toggle));
    if (habit) {
      habit.done = !habit.done;
      habit.streak = habit.done ? habit.streak + 1 : Math.max(0, habit.streak - 1);
      saveHabits();
      renderHabits();
    }
  }
  if (remove) {
    habits = habits.filter((item) => item.id !== Number(remove.dataset.delete));
    saveHabits();
    renderHabits();
  }
});

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest(".filter-button");
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter-button").forEach((item) => {
    item.classList.toggle("active", item === button);
    item.setAttribute("aria-pressed", String(item === button));
  });
  renderHabits();
});

document.getElementById("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  document.getElementById("themeButton").textContent = isLight ? "🌙" : "☀️";
  document.getElementById("themeButton").setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  localStorage.setItem("habitly-theme", isLight ? "light" : "dark");
});

document.getElementById("resetButton").addEventListener("click", () => {
  habits = structuredClone(demoHabits);
  saveHabits();
  renderHabits();
});

if (localStorage.getItem("habitly-theme") === "light") {
  document.body.classList.add("light");
  document.getElementById("themeButton").textContent = "🌙";
  document.getElementById("themeButton").setAttribute("aria-label", "Switch to dark mode");
}

setDate();
setQuote();
renderWeek();
renderHabits();
