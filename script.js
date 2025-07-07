// Referencias
const timerEl     = document.getElementById('timer');
const circleEl    = document.querySelector('.progress-circle circle:nth-child(1)');
const addBtn      = document.getElementById('add');
const startBtn    = document.getElementById('start');
const resetBtn    = document.getElementById('reset');
const zoneSelect  = document.getElementById('zone');
const costEl      = document.getElementById('cost');
const historyUl   = document.getElementById('history-list');
const clearHist   = document.getElementById('clear-history');
const toggleTheme = document.getElementById('toggle-theme');

let totalSeconds   = 0;
let initialSeconds = 0;
let intervalId     = null;

// Cargar historial y tema
let history = JSON.parse(localStorage.getItem('pm_history')) || [];
if (localStorage.getItem('pm_theme') === 'dark') {
  document.body.classList.add('dark');
}
renderHistory();
updateDisplay();

// Funciones
function updateDisplay() {
  const mins = Math.floor(totalSeconds/60);
  const secs = totalSeconds % 60;
  timerEl.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  // progreso circular
  const pct = initialSeconds ? totalSeconds/initialSeconds : 0;
  const dash = 565.48 * (1 - pct);
  circleEl.style.strokeDashoffset = dash;

  // costo estimado
  const rate = parseFloat(zoneSelect.value);
  costEl.textContent = (mins * rate).toFixed(2);
}

function renderHistory() {
  historyUl.innerHTML = '';
  history.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    historyUl.appendChild(li);
  });
}

function addHistory(minutes, cost) {
  const now  = new Date().toLocaleString();
  const text = `${now} — ${minutes} min — $${cost} MXN`;
  history.unshift(text);
  localStorage.setItem('pm_history', JSON.stringify(history));
  renderHistory();
}

// Events
addBtn.onclick = () => {
  totalSeconds += 60;
  initialSeconds = totalSeconds;
  updateDisplay();
};

startBtn.onclick = () => {
  if (intervalId) return;
  intervalId = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      updateDisplay();
    } else {
      clearInterval(intervalId);
      intervalId = null;
      const mins = Math.floor(initialSeconds/60);
      addHistory(mins, (mins * parseFloat(zoneSelect.value)).toFixed(2));
      alert('¡Tiempo terminado!');
    }
  }, 1000);
};

resetBtn.onclick = () => {
  const mins = Math.floor(totalSeconds/60);
  if (mins > 0) {
    addHistory(mins, (mins * parseFloat(zoneSelect.value)).toFixed(2));
  }
  clearInterval(intervalId);
  intervalId     = null;
  totalSeconds   = 0;
  initialSeconds = 0;
  updateDisplay();
};

clearHist.onclick = () => {
  history = [];
  localStorage.removeItem('pm_history');
  renderHistory();
};

toggleTheme.onclick = () => {
  document.body.classList.toggle('dark');
  const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('pm_theme', mode);
};

zoneSelect.onchange = updateDisplay;    