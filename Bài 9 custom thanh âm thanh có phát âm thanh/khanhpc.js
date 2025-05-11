const slider = document.getElementById("volumeSlider");
const valueDisplay = document.getElementById("volumeValue");
const voloumeIcon = document.getElementById("voloumeIcon");
const audio = document.getElementById("sampleAudio");
const toggleBtn = document.getElementById("togglePlay");
const audioSelector = document.getElementById("audioSelector");
const audioSource = document.getElementById("audioSource");
const playPauseIcon = document.getElementById("playPauseIcon");

let lastVolume = slider.value;
slider.addEventListener("input",() => {
    const value = parseInt(slider.value);
    if (value === lastVolume) return;
    lastVolume = value;
    valueDisplay.textContent = `${value}%`
    audio.volume = value / 100;

if (value === 0) {
  voloumeIcon.className = "fas fa-volume-mute text-gray-400 transition-all duration-300";
      valueDisplay.className = "text-lg font-semibold text-gray-400 w-14 text-right transition-all duration-300";
  } else if (value < 30) {
    volumeIcon.className = "fas fa-volume-off text-yellow-400 transition-all duration-300";
    valueDisplay.className = "text-lg font-semibold text-yellow-400 w-14 text-right transition-all duration-300";
  } else if (value < 70) {
    volumeIcon.className = "fas fa-volume-down text-cyan-400 transition-all duration-300";
    valueDisplay.className = "text-lg font-semibold text-cyan-400 w-14 text-right transition-all duration-300";
  } else {
    volumeIcon.className = "fas fa-volume-up text-green-400 transition-all duration-300";
    valueDisplay.className = "text-lg font-semibold text-green-400 w-14 text-right transition-all duration-300";
  }
});

toggleBtn.addEventListener("click",() =>{
if (audio.paused) {
    audio.play();
    playPauseIcon.className = "fas fa-pause-circle";
    toggleBtn.classList.remove("text-green-400");
    toggleBtn.classList.add("text-red-400");
  } else {
    audio.pause();
    playPauseIcon.className = "fas fa-play-circle";
    toggleBtn.classList.remove("text-red-400");
    toggleBtn.classList.add("text-green-400");
  }
});
audioSelector.addEventListener("change",() =>{
  let selectedAudio = audioSelector.value;
  if (!audio.paused){
    playPauseIcon.className = "fas fa-play-circle";
    toggleBtn.classList.remove("text-red-400");
    toggleBtn.classList.add("text-green-400");
  }
  switch(selectedAudio){
        case '1':
      audioSource.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Biển Cả
      break;
    case '2':
      audioSource.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"; // Rừng Xanh
      break;
    case '3':
      audioSource.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"; // Mưa Rơi
      break;
    case '4':
      audioSource.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"; // Sóng Vỗ
      break;
    case '5':
      audioSource.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"; // Nhạc Chill
      break;
    case '6':
      audioSource.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"; // Bão Tố
      break;
    default:
      audioSource.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  }


    audio.load();
    if (!audio.paused){
      audio.play();
      playPauseIcon.className = "fas fa-pause-circle";
      toggleBtn.classList.remove("text-green-400");
      toggleBtn.classList.add("text-red-400");
    }
  });