/* ========= STORAGE KEYS ========= */
const TEMPLATE_KEY = "workoutTemplates";
const HISTORY_KEY = "workoutHistory";

/* ========= INIT AFTER DOM ========= */
document.addEventListener("DOMContentLoaded", () => {
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

  /* ========= HELPER FUNCTIONS ========= */
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

  /* ========= NAVIGATION ========= */
  navLog.addEventListener("click", () => showScreen(logScreen));
  navHistory.addEventListener("click", () => {
    renderHistory();
    showScreen(historyScreen);
  });
  navSetup.addEventListener("click", () => {
    renderTemplates();
    showScreen(setupScreen);
  });

  /* ========= SETUP ========= */
  function renderTemplates() {
    const templates = load(TEMPLATE_KEY);
    templateList.innerHTML = "";

    templates.forEach((t, i) => {
      const div = document.createElement("div");
      div.className = "template-item";
      div.textContent = `${t.name}: ${t.exercises.join(", ")}`;
      templateList.appendChild(div);
    });
  }

  saveTemplateBtn.addEventListener("click", () => {
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
  });

  /* ========= LOG SCREEN ========= */
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

  /* Render exercises with multiple sets */
  function renderExercises(exercises) {
    exerciseList.innerHTML = "";

    exercises.forEach(name => {
      const block = document.createElement("div");
      block.className = "exercise-block";

      const setsContainer = document.createElement("div");
      setsContainer.className = "sets-container";

      // Start with one set
      addSetRow(setsContainer);

      const addSetBtn = document.createElement("button");
      addSetBtn.textContent = "Add Set";
      addSetBtn.style.marginTop = "8px";
      addSetBtn.addEventListener("click", () => addSetRow(setsContainer));

      block.innerHTML = `<h3>${name}</h3>`;
      block.appendChild(setsContainer);
      block.appendChild(addSetBtn);

      exerciseList.appendChild(block);
    });
  }

  /* Add a single set row */
  function addSetRow(container, setData = {}) {
    const row = document.createElement("div");
    row.className = "set-row";
    row.style.display = "flex";
    row.style.gap = "6px";
    row.style.marginBottom = "6px";

    // Rest time: dropdown for minutes + seconds
    const restMinutes = document.createElement("select");
    for (let i = 0; i <= 30; i++) {
      const opt = document.createElement("option");
      opt.value = i * 60;
      opt.textContent = `${i} min`;
      if (i * 60 === (setData.rest || 0)) opt.selected = true;
      restMinutes.appendChild(opt);
    }

    const restSeconds = document.createElement("select");
    for (let i = 0; i < 60; i += 5) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${i} sec`;
      if (i === ((setData.rest || 0) % 60)) opt.selected = true;
      restSeconds.appendChild(opt);
    }

    // Set row inputs
    row.innerHTML = `
      <input type="number" placeholder="Reps" value="${setData.reps || ""}" style="width:60px">
      <input type="number" placeholder="Weight (kg)" value="${setData.weight || ""}" style="width:80px">
      <button style="width:50px;background:#ff3b30;color:white;border:none;border-radius:6px;cursor:pointer;">X</button>
    `;

    const deleteBtn = row.querySelector("button");
    deleteBtn.addEventListener("click", () => container.removeChild(row));

    // Append rest time selectors
    row.appendChild(restMinutes);
    row.appendChild(restSeconds);

    container.appendChild(row);
  }

  /* When workout changes, load exercises */
  workoutSelect.addEventListener("change", () => {
    const templates = load(TEMPLATE_KEY);
    const template = templates[workoutSelect.value];
    if (template) renderExercises(template.exercises);
  });

  /* Save the workout */
  saveWorkoutBtn.addEventListener("click", () => {
    const templates = load(TEMPLATE_KEY);
    const template = templates[workoutSelect.value];
    if (!template) return;

    const blocks = document.querySelectorAll(".exercise-block");
    const exercises = [];

    blocks.forEach(block => {
      const setsContainer = block.querySelector(".sets-container");
      const setRows = setsContainer.querySelectorAll(".set-row");

      const sets = Array.from(setRows).map(row => {
        const inputs = row.querySelectorAll("input");
        const selects = row.querySelectorAll("select");
        const rest = parseInt(selects[0].value) + parseInt(selects[1].value); // minutes + seconds
        return {
          reps: inputs[0].value,
          weight: inputs[1].value,
          rest
        };
      });

      exercises.push({
        name: block.querySelector("h3").textContent,
        sets
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
  });

  /* ========= HISTORY ========= */
  function renderHistory() {
    const history = load(HISTORY_KEY);
    historyList.innerHTML = "";

    history.forEach(day => {
      const dayDiv = document.createElement("div");
      dayDiv.className = "history-day";

      dayDiv.innerHTML = `<h2>${day.date}</h2>
                          <div class="history-workout">${day.workout}</div>`;

      day.exercises.forEach(ex => {
        const exDiv = document.createElement("div");
        exDiv.className = "history-exercise";

        exDiv.innerHTML = `<h4>${ex.name}</h4>`;
        const setsContainer = document.createElement("div");
        setsContainer.className = "history-details";

        ex.sets.forEach((set, i) => {
          const minutes = Math.floor(set.rest / 60);
          const seconds = set.rest % 60;
          const setDiv = document.createElement("div");
          setDiv.textContent = `Set ${i + 1}: ${set.reps} reps, ${set.weight} kg, Rest: ${minutes}m ${seconds}s`;
          setsContainer.appendChild(setDiv);
        });

        exDiv.appendChild(setsContainer);
        dayDiv.appendChild(exDiv);
      });

      historyList.appendChild(dayDiv);
    });
  }

  /* ========= INIT ========= */
  populateWorkoutSelect();
});
