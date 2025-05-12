 // Bản đồ phím bàn phím sang nốt đàn
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

  // Tần số các nốt đàn piano (một quãng 1 octave)
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

  // Phát nốt nhạc dùng Web Audio API
  function playNote(note) {
    if (!noteFrequencies[note]) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = noteFrequencies[note];
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();

    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    osc.stop(audioCtx.currentTime + 1);
  }

  // Hiệu ứng nổi bật phím nhấn
  function highlightKey(note) {
    const whiteKeys = document.querySelectorAll('.white-key');
    const blackKeys = document.querySelectorAll('.black-key');
    let keyElem = null;

    whiteKeys.forEach(k => { if (k.dataset.note === note) keyElem = k; });
    blackKeys.forEach(k => { if (k.dataset.note === note) keyElem = k; });

    if (keyElem) {
      keyElem.classList.add('active');
      setTimeout(() => {
        keyElem.classList.remove('active');
      }, 180);
    }
  }

  // Xử lý sự kiện bàn phím
  const pressedKeys = new Set();

  function onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (pressedKeys.has(key)) return; // Tránh lặp lại khi giữ phím
    if (keyMap[key]) {
      pressedKeys.add(key);
      playNote(keyMap[key]);
      highlightKey(keyMap[key]);
    }
  }

  function onKeyUp(e) {
    const key = e.key.toLowerCase();
    if (pressedKeys.has(key)) {
      pressedKeys.delete(key);
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Cho phép nhấn chuột hoặc chạm trên phím để chơi (dành cho mobile)
  function onClickKey(e) {
    const key = e.currentTarget;
    const note = key.dataset.note;
    if (note) {
      playNote(note);
      key.classList.add('active');
      setTimeout(() => {
        key.classList.remove('active');
      }, 180);
    }
  }

  const allKeys = document.querySelectorAll('.white-key, .black-key');
  allKeys.forEach(key => {
    key.addEventListener('mousedown', onClickKey);
    key.addEventListener('touchstart', onClickKey);
  });
