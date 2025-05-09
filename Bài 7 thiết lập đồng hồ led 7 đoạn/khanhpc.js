
const BANG_MAP = {
  '0': ['a','b','c','d','e','f'],
  '1': ['b','c'],
  '2': ['a','b','g','e','d'],
  '3': ['a','b','g','c','d'],
  '4': ['f','g','b','c'],
  '5': ['a','f','g','c','d'],
  '6': ['a','f','g','e','d','c'],
  '7': ['a','b','c'],
  '8': ['a','b','c','d','e','f','g'],
  '9': ['a','b','c','d','f','g'],
};

let nhapNhay = true;

function taoSo() {
  const s = document.createElement('div');
  s.className = 'so';
  for (let p of ['a','b','c','d','e','f','g']) {
    const phanDoan = document.createElement('div');
    phanDoan.className = 'phan-doan ' + p;
    s.appendChild(phanDoan);
  }
  return s;
}

function hienThiDongHo() {
  const ngay = new Date();
  const dongHo = document.getElementById('dong-ho');
  const ngayThang = document.getElementById('ngay-thang');
  dongHo.innerHTML = '';

  const t = ngay.getHours().toString().padStart(2, '0') +
            ngay.getMinutes().toString().padStart(2, '0') +
            ngay.getSeconds().toString().padStart(2, '0') +
            ngay.getMilliseconds().toString().padStart(3, '0');

  const cauHinh = [
    t[0], t[1], ':',
    t[2], t[3], ':',
    t[4], t[5], '.',
    t[6], t[7], t[8]
  ];

  for (let ch of cauHinh) {
    if (ch === ':' || ch === '.') {
      const kyTu = document.createElement('div');
      kyTu.className = 'ky-tu';
      kyTu.textContent = ch;
      if (ch === ':' && !nhapNhay) kyTu.classList.add('bi-mat');
      dongHo.appendChild(kyTu);
    } else {
      const so = taoSo();
      const phanHoatDong = BANG_MAP[ch] || [];
      [...so.children].forEach(phanDoan =>
        phanDoan.classList.toggle('bat', phanHoatDong.includes(phanDoan.classList[1]))
      );
      dongHo.appendChild(so);
    }
  }

  const dStr = ngay.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  ngayThang.textContent = dStr;
}

setInterval(hienThiDongHo, 50);
setInterval(() => nhapNhay = !nhapNhay, 500);