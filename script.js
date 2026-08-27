const DURATIONS = { focus: 25 * 60, break: 5 * 60, longBreak: 15 * 60 };
const MODE_LABELS = { focus: 'Focus session', break: 'Short break', longBreak: 'Long break' };
const STORAGE_KEY = 'focus-completed-sessions';

const timerDisplay = document.querySelector('#timerDisplay');
const startButton = document.querySelector('#startButton');
const pauseButton = document.querySelector('#pauseButton');
const resetButton = document.querySelector('#resetButton');
const modeLabel = document.querySelector('#modeLabel');
const modeDot = document.querySelector('#modeDot');
const statusLabel = document.querySelector('#statusLabel');
const progressBar = document.querySelector('#progressBar');
const timerCard = document.querySelector('#timerCard');

let currentMode = 'focus';
let remainingSeconds = DURATIONS.focus;
let timerId = null;
let completedSessions = loadSessions();

function loadSessions() {
  const saved = Number.parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  return Number.isFinite(saved) && saved >= 0 ? saved : 0;
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, String(completedSessions));
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
  document.title = `${formatTime(remainingSeconds)} - ${MODE_LABELS[currentMode]} | FOCUS`;
  const progress = (remainingSeconds / DURATIONS[currentMode]) * 100;
  progressBar.style.width = `${progress}%`;
}

function setMode(mode) {
  if (timerId) stopTimer();
  currentMode = mode;
  remainingSeconds = DURATIONS[mode];
  modeLabel.textContent = MODE_LABELS[mode];
  modeDot.style.background = mode === 'focus' ? 'var(--mint)' : 'var(--peach)';
  statusLabel.textContent = 'Not started';
  timerCard.classList.remove('running');
  startButton.textContent = 'Start';
  pauseButton.disabled = true;
  document.querySelectorAll('.mode-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
  updateDisplay();
}

function startTimer() {
  if (timerId) return;
  statusLabel.textContent = 'In progress';
  startButton.textContent = 'Running';
  startButton.disabled = true;
  pauseButton.disabled = false;
  timerCard.classList.add('running');
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateDisplay();
    if (remainingSeconds <= 0) completeTimer();
  }, 1000);
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = null;
  startButton.disabled = false;
  timerCard.classList.remove('running');
}

function pauseTimer() {
  if (!timerId) return;
  stopTimer();
  statusLabel.textContent = 'Paused';
  startButton.textContent = 'Resume';
  pauseButton.disabled = true;
}

function resetTimer() {
  setMode(currentMode);
  statusLabel.textContent = 'Not started';
}

function completeTimer() {
  stopTimer();
  remainingSeconds = 0;
  updateDisplay();
  statusLabel.textContent = 'Complete';
  startButton.disabled = false;
  pauseButton.disabled = true;
  if (currentMode === 'focus') {
    completedSessions += 1;
    saveSessions();
    updateSessionDisplay();
  }
  window.setTimeout(() => {
    const nextMode = currentMode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
  }, 1200);
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
document.querySelectorAll('.mode-button').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

updateDisplay();
