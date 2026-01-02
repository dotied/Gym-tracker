/* ========= STORAGE KEYS ========= */
const TEMPLATE_KEY = "workoutTemplates";
const HISTORY_KEY = "workoutHistory";

/* ========= ELEMENTS ========= */
const logScreen = document.getElementById("log-screen");
const historyScreen = document.getElementById("history-screen");
const setupScreen = document.getElementById("setup-screen");

const navLog = document.getElementById("nav-log");
const navHistory = document.getElementById("nav-history");
const navSetup = document.getElementById("nav-setup");

const workoutSelect = document.getElementById("workout-select");
const exerciseList = document.getElementById("exercise-list");
const saveWorkoutBtn = document.getElementById("save-workout");

const workoutNameInput = document.getElementById("workout-name");
const exerciseInput = document.getElementById("exercise-input");
const saveTemplateBtn = document.getElementById("save-template");
const templateList = document.getElementById("template-list");

const historyList = document.getElementById("history-list");

/* ========= HELPERS ========= */
function load(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function showScreen(screen) {
  [logScreen, historyScreen, setupScreen].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

/* ========= NAV ========= */
navLog.onclick = () => showScreen(logScreen);
navHistory.onclick = () => {
  renderHistory();
  showScreen(historyScreen);
};
navSetup.onclick = () => {
  renderTemplates();
  showScreen(setupScreen);
};

/* ========= SETUP ========= */
function renderTemplates() {
  const templates = load(TEMPLATE_KEY);
  templateList.innerHTML = "";

  templates.forEach(t => {
    const div = document.createElement("div");
    div.className = "template-item";
    div.textContent = `${t.name}: ${t.exercises.join(", ")}`;
    templateList.appendChild(div);
  });
}

saveTemplateBtn.onclick = () => {
  const name = workoutNameInput.value.trim();
  const exercises = exerciseInput.value
    .split("\n")
    .map(e => e.trim())
    .filter(e => e);

  if (!name || exercises.length === 0) return;

  const templates = load(TEMPLATE_KEY);
  templates.push({ name, exercises });
  save(TEMPLATE_KEY, templates);

  workoutNameInput.value = "";
  exerciseInput.value = "";

  populateWorkoutSelect();
  renderTemplates();
};

/* ========= LOG ========= */
function populateWorkoutSelect() {
  const templates = load(TEMPLATE_KEY);
  workoutSelect.innerHTML = "";

  templates.forEach((t, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = t.name;
    workoutSelect.appendChild(opt);
  });

  if (templates.length > 0) {
    renderExercises(templates[0].exercises);
  } else {
    showScreen(setupScreen);
  }
}

function renderExercises(exercises) {
  exerciseList.innerHTML = "";

  exercises.forEach(name => {
    const block = document.createElement("div");
    block.className = "exercise-block";

    block.innerHTML = `
      <h3>${name}</h3>
      <div class="exercise-fields">
        <input placeholder="Sets" type="number">
        <input placeholder="Reps" type="number">
        <input placeholder="Weight" type="number">
        <input placeholder="Rest (sec)" type="number">
      </div>
    `;

    exerciseList.appendChild(block);
  });
}

workoutSelect.onchange = () => {
  const templates = load(TEMPLATE_KEY);
  const template = templates[workoutSelect.value];
  if (template) renderExercises(template.exercises);
};

saveWorkoutBtn.onclick = () => {
  const templates = load(TEMPLATE_KEY);
  const template = templates[workoutSelect.value];
  if (!template) return;

  const blocks = document.querySelectorAll(".exercise-block");
  const exercises = [];

  blocks.forEach(block => {
    const inputs = block.querySelectorAll("input");
    exercises.push({
      name: block.querySelector("h3").textContent,
      sets: inputs[0].value,
      reps: inputs[1].value,
      weight: inputs[2].value,
      rest: inputs[3].value
    });
  });

  const history = load(HISTORY_KEY);
  history.unshift({
    date: new Date().toLocaleDateString(),
    workout: template.name,
    exercises
  });

  save(HISTORY_KEY, history);
  alert("Workout saved");
};

/* ========= HISTORY ========= */
function renderHistory() {
  const history = load(HISTORY_KEY);
  historyList.innerHTML = "";

  history.forEach(day => {
    const dayDiv = document.createElement("div");
    dayDiv.className = "history-day";

    dayDiv.innerHTML = `
      <h2>${day.date}</h2>
      <div class="history-workout">${day.workout}</div>
    `;

    day.exercises.forEach(ex => {
      const exDiv = document.createElement("div");
      exDiv.className = "history-exercise";

      exDiv.innerHTML = `
        <h4>${ex.name}</h4>
        <div class="history-details">
          <div>Sets: ${ex.sets}</div>
          <div>Reps: ${ex.reps}</div>
          <div>Weight: ${ex.weight}</div>
          <div>Rest: ${ex.rest}</div>
        </div>
      `;

      dayDiv.appendChild(exDiv);
    });

    historyList.appendChild(dayDiv);
  });
}

/* ========= INIT ========= */
populateWorkoutSelect();
