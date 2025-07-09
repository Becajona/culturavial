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

// Inicializa el mapa
const map = L.map('map').setView([19.0414395, -98.2062728], 14); // Cambia por coordenadas de tu ciudad

// Añade capa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Añade marcadores de zonas
L.marker([19.0414395, -98.2062728]).addTo(map)
  .bindPopup('<b>Zona Centro</b><br>1.5 MXN/min').openPopup();

L.marker([19.045, -98.21]).addTo(map)
  .bindPopup('<b>Zona Residencial</b><br>2 MXN/min');

L.marker([19.038, -98.200]).addTo(map)
  .bindPopup('<b>Zona Comercial</b><br>3 MXN/min');

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

function lanzarNotificacion(titulo, mensaje) {
  if (Notification.permission === 'granted') {
    new Notification(titulo, { body: mensaje });
  } else {
    alert(mensaje); // fallback si no dio permiso
  }
}

// Verifica soporte y pide permiso al usuario
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then(permission => {
    console.log('Permiso de notificaciones:', permission);
  });
}

document.getElementById('enable-notifs').onclick = () => {
  Notification.requestPermission().then(permission => {
    alert('Permiso de notificaciones: ' + permission);
  });
};

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

      // 🚨 Avisar cuando falten 5 minutos (300 seg)
      if (totalSeconds === 300) {
        lanzarNotificacion(
          'Parquímetro - Aviso',
          '⏳ Quedan 5 minutos para que expire tu parquímetro.'
        );
      }

    } else {
      clearInterval(intervalId);
      intervalId = null;
      const mins = Math.floor(initialSeconds / 60);
      addHistory(mins, (mins * parseFloat(zoneSelect.value)).toFixed(2));
      lanzarNotificacion('Parquímetro', '¡⏰ Tu tiempo de parquímetro ha terminado!');
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