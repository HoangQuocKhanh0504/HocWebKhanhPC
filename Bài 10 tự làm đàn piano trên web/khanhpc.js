  const keyMap = {
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4',
    'k': 'C5'
  };

  const noteFrequencies = {
    'C4': 261.63,
    'C#4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'B4': 493.88,
    'C5': 523.25
  };

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const playingNotes = new Map();

  function startNote(note) {
    if (!noteFrequencies[note] || playingNotes.has(note)) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = noteFrequencies[note];
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();

    playingNotes.set(note, { osc, gainNode });
  }

  function stopNote(note) {
    const noteObj = playingNotes.get(note);
    if (noteObj) {
      noteObj.gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      noteObj.osc.stop(audioCtx.currentTime + 0.3);
      playingNotes.delete(note);
    }
  }

  function highlightKey(note) {
    const keys = document.querySelectorAll('.white-key, .black-key');
    keys.forEach(k => {
      if (k.dataset.note === note) {
        k.classList.add('active');
      }
    });
  }

  function unhighlightKey(note) {
    const keys = document.querySelectorAll('.white-key, .black-key');
    keys.forEach(k => {
      if (k.dataset.note === note) {
        k.classList.remove('active');
      }
    });
  }

  const pressedKeys = new Set();

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
    if (pressedKeys.has(key)) {
      pressedKeys.delete(key);
      stopNote(note);
      unhighlightKey(note);
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Cho chuột và cảm ứng
  const allKeys = document.querySelectorAll('.white-key, .black-key');

  allKeys.forEach(k => {
    const note = k.dataset.note;

    // Chuột
    k.addEventListener('mousedown', () => {
      startNote(note);
      highlightKey(note);
    });

    k.addEventListener('mouseup', () => {
      stopNote(note);
      unhighlightKey(note);
    });

    // Cảm ứng
    k.addEventListener('touchstart', e => {
      e.preventDefault();
      startNote(note);
      highlightKey(note);
    }, { passive: false });

    k.addEventListener('touchend', () => {
      stopNote(note);
      unhighlightKey(note);
    });
  });

  // Dừng khi rời chuột khỏi phím (nếu cần)
  document.addEventListener('mouseup', () => {
    playingNotes.forEach((_, note) => {
      stopNote(note);
      unhighlightKey(note);
    });
    pressedKeys.clear();
  });

  document.addEventListener('touchend', () => {
    playingNotes.forEach((_, note) => {
      stopNote(note);
      unhighlightKey(note);
    });
    pressedKeys.clear();
  });