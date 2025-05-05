// các giao diện và màu chữ //
const danhSachGiaoDien = [
    {nen: '#1e1e2f', chu: '#ffffff'},
    {nen: '#f5f5f5', chu: '#222222'},
    {nen: '#222831', chu: '#eeeeee'},
    {nen: '#ffecd2', chu: '#2b2e4a'},
    {nen: '#4b79a1', chu: '#ffffff'},
    {nen: '#fdfcfb', chu: '#2c3e50'},
    {nen: '#121212', chu: '#e0e0e0'},
    {nen: '#3a1c71', chu: '#ffffff'},
    {nen: '#ffe259', chu: '#1f1f1f'},
    {nen: '#43cea2', chu: '#ffffff'},
    {nen: '#373B44', chu: '#FAFAFA'},
    {nen: '#f0f2f5', chu: '#333333'},
    {nen: '#ff9a9e', chu: '#1a1a1a'},
    {nen: '#00c6ff', chu: '#003366'},
    {nen: '#2c3e50', chu: '#ecf0f1'},
    {nen: '#8e44ad', chu: '#f5f5f5'},
    {nen: '#16a085', chu: '#ffffff'},
    {nen: '#2f2f2f', chu: '#e6e6e6'},
    {nen: '#f7f8f9', chu: '#1c1c1c'},
    {nen: '#bdc3c7', chu: '#2c3e50'},
];
//danh sách hiệu ứng ngẫu nhiên //
const hieuUng = ['mo-dan','phong-to','xoay-tron','truot-xuong'];
// đổi giao diện và hiệu ứng//
function doiGiaoDien() {
    const giaoDien = danhSachGiaoDien[Math.floor(Math.random() * danhSachGiaoDien.length)];
    const hieuUngNgauNhien = hieuUng[Math.floor(Math.random() * hieuUng.length)];
    // xóa đi hiệu ứng cũ nếu có//
    document.body.className = '';
    void document.body.offsetWidth;// dòng này để reset hiệu ứng
    // thêm hiệu ứng mới vào//
    document.body.classList.add(hieuUngNgauNhien);
    // đổi màu chữ và nền
    document.body.style.backgroundColor=giaoDien.nen;//nền
    document.body.style.color=giaoDien.chu;//chữ
};
//chặn bôi đen//
document.addEventListener('DOMContentLoaded',function(){
    document.body.style.userSelect = 'none';

    document.body.add.addEventListener('selectstart',function(e){
        e.preventDefault();
    });

    document.body.addEventListener('mousedown',function(e){
        e.preventDefault();
    });
});
