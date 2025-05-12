const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const noteFrequencies = {
  "C4": 261.63,
  "C#4": 277.18,
  "D4": 293.66,
  "D#4": 311.13,
  "E4": 329.63,
  "F4": 349.23,
  "F#4": 369.99,
  "G4": 392.00,
  "G#4": 415.30,
  "A4": 440.00,
  "A#4": 466.16,
  "B4": 493.88,
  "C5": 523.25
};

const keyMap = {
  "a": "C4",
  "w": "C#4",
  "s": "D4",
  "e": "D#4",
  "d": "E4",
  "f": "F4",
  "t": "F#4",
  "g": "G4",
  "y": "G#4",
  "h": "A4",
  "u": "A#4",
  "j": "B4",
  "k": "C5"
};

const pressedKeys = new Set();
const activeOscillators = {}; // { note: {osc, gainNode} }

function startNote(note) {
  if (!noteFrequencies[note] || activeOscillators[note]) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.value = noteFrequencies[note];
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();

  activeOscillators[note] = { osc, gainNode };
}

function stopNote(note) {
  const active = activeOscillators[note];
  if (active) {
    active.gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    active.osc.stop(audioCtx.currentTime + 0.2);
    delete activeOscillators[note];
  }
}

function onKeyDown(e) {
  const key = e.key.toLowerCase();
  if (pressedKeys.has(key)) return;
  const note = keyMap[key];
  if (note) {
    pressedKeys.add(key);
    startNote(note);
    highlightKey(note);
  }
}

function onKeyUp(e) {
  const key = e.key.toLowerCase();
  const note = keyMap[key];
  if (note && pressedKeys.has(key)) {
    pressedKeys.delete(key);
    stopNote(note);
  }
}

function highlightKey(note) {
  const keys = document.querySelectorAll('.key');
  keys.forEach(k => {
    if (k.dataset.note === note) {
      k.classList.add('active');
      setTimeout(() => k.classList.remove('active'), 100);
    }
  });
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Optional: click/touch support
document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('mousedown', () => {
    const note = key.dataset.note;
    startNote(note);
    highlightKey(note);
  });
  key.addEventListener('mouseup', () => {
    const note = key.dataset.note;
    stopNote(note);
  });
  key.addEventListener('mouseleave', () => {
    const note = key.dataset.note;
    stopNote(note);
  });
  key.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const note = key.dataset.note;
    startNote(note);
    highlightKey(note);
  }, { passive: false });
  key.addEventListener('touchend', (e) => {
    e.preventDefault();
    const note = key.dataset.note;
    stopNote(note);
  }, { passive: false });
});
