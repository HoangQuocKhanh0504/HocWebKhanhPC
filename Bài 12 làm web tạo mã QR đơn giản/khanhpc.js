let qrcode;

function generateQR() {
  const inputText = document.getElementById("text").value.trim();
  const color = document.getElementById("color").value;

  if (!inputText) {
    alert("Bạn chưa nhập nội dung!");
    return;
  }

  // Xoá mã cũ
  document.getElementById("qrcode").innerHTML = "";

  // Tạo mới
  qrcode = new QRCode(document.getElementById("qrcode"), {
    text: inputText,
    width: 256,
    height: 256,
    colorDark: color,
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  // Hiện nút tải ảnh
  setTimeout(() => {
    document.getElementById("downloadBtn").style.display = "inline-block";
  }, 500);
}

function downloadQR() {
  const qrCanvas = document.querySelector("#qrcode canvas");
  if (!qrCanvas) return alert("Bạn chưa tạo mã QR nào cả!");
  
  const dataURL = qrCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "khanhpc_qr.png";
  link.click();
}
