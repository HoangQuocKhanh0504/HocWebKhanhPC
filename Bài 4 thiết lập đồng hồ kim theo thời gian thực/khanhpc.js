const dongHo = document.querySelector('.dong-ho-container');
// Tọa độ trung tâm
const centerX = 175;
const centerY = 175;
const radius = 140;

// Tạo các phần tử số và đặt chúng theo toán học hình học
for(let num=1; num<=12; num++){
  const numberEl = document.createElement('div');
  numberEl.classList.add('so');
  numberEl.textContent = num;

  // Góc tính theo radians
  let angle = (num / 12) * (2 * Math.PI) - Math.PI / 2;
  let x = centerX + radius * Math.cos(angle);
  let y = centerY + radius * Math.sin(angle);

  // Đặt vị trí của phần tử số ở (x, y), điều chỉnh theo độ lệch
  numberEl.style.left = (x - 15) + 'px'; // nửa chiều rộng 30/2=15
  numberEl.style.top = (y - 15) + 'px';  // nửa chiều cao 30/2=15

  dongHo.appendChild(numberEl);
}

// Tạo các kim đồng hồ
const kimGio = document.createElement('div');
kimGio.classList.add('kim-element', 'gio');
dongHo.appendChild(kimGio);

const kimPhut = document.createElement('div');
kimPhut.classList.add('kim-element', 'phut');
dongHo.appendChild(kimPhut);

const kimGiay = document.createElement('div');
kimGiay.classList.add('kim-element', 'giay');
dongHo.appendChild(kimGiay);

// Vòng tròn trung tâm
const vongTron = document.createElement('div');
vongTron.classList.add('vong-tron-trung-tam');
dongHo.appendChild(vongTron);

// Hàm cập nhật để đặt góc quay của các kim đồng hồ theo thời gian hiện tại
function capNhatDongHo() {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;

  // Tính toán các góc quay
  // Mỗi giây = 6 độ
  const secondDeg = seconds * 6; 
  // Mỗi phút = 6 độ + phần trăm của giây
  const minuteDeg = minutes * 6 + seconds * 0.1;
  // Mỗi giờ = 30 độ + phần trăm của phút
  const hourDeg = hours * 30 + minutes * 0.5;

  // Quay các kim đồng hồ
  kimGiay.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`; 
  kimPhut.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`; 
  kimGio.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`; 
}

// Cập nhật ban đầu
capNhatDongHo();

// Cập nhật mỗi 1000ms
setInterval(capNhatDongHo, 1000);