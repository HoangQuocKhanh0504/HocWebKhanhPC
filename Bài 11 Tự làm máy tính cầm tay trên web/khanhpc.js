const display = document.getElementById('display');
const clickSound = document.getElementById('clickSound');
function playSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}
function append(value) {
  if (display.innerText === 'Lỗi') {
    clearDisplay();
  }

  if (display.innerText === '0') {
    display.innerText = value;
  } else {
    display.innerText += value;
  }
}
function clearDisplay() {
  display.innerText = '0';
}
function delChar() {
  if (display.innerText.length <= 1 || display.innerText === 'Lỗi') {
    clearDisplay();
  } else {
    display.innerText = display.innerText.slice(0, -1);
  }
}
function calculate() {
  try {
    display.innerText = eval(display.innerText.replace(/÷/g, '/').replace(/×/g, '*'));
  } catch {
    display.innerText = 'Lỗi';
  }
}
document.addEventListener('mousedown', function(e) {
  e.preventDefault();
});
document.addEventListener('selectstart', function(e) {
  e.preventDefault();
});