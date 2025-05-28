import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('productList');
    const backToSeatsBtn = document.getElementById('backToSeats');
    const proceedToPaymentBtn = document.getElementById('proceedToPayment');
    const countdownDiv = document.getElementById('countdown');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get('showId');
    const bookingId = urlParams.get('bookingId');
    const cinemaId = urlParams.get('cinemaId');

    console.log(`[${new Date().toISOString()}] Khởi tạo select-products.js`, { showId, bookingId, cinemaId });

    // Biến để kiểm soát trạng thái
    let isExpired = false;
    let isCancelling = false;

    if (!showId || !bookingId || isNaN(showId) || isNaN(bookingId)) {
        loading.style.display = 'none';
        error.textContent = 'Thiếu hoặc không hợp lệ thông tin suất chiếu hoặc đặt vé!';
        error.style.display = 'block';
        console.error(`[${new Date().toISOString()}] Thiếu tham số URL`, { showId, bookingId });
            return;
        }

    let selectedProducts = JSON.parse(localStorage.getItem(`products_${bookingId}`)) || [];

    // Hàm vô hiệu hóa các tương tác
   

    // Hàm kiểm tra và chuyển hướng khi hết hạn
    const handleExpiration = async () => {
        if (isExpired || isCancelling) return; // Tránh gọi nhiều lần
        
        isExpired = true;
        isCancelling = true;
        disableInteractions();
        
        try {
            await api.cancelBooking(bookingId);
            localStorage.removeItem(`products_${bookingId}`);
            localStorage.removeItem(`hold_${bookingId}`);
            // Đợi 1.5s để người dùng thấy thông báo
            setTimeout(() => {
                window.location.href = `seat-map.html?showId=${showId}&cinemaId=${cinemaId}`;
            }, 1500);
        } catch (err) {
            error.textContent = 'Lỗi khi hủy đặt vé: ' + err.message;
            error.style.display = 'block';
            console.error(`[${new Date().toISOString()}] Lỗi hủy booking`, err);
            isCancelling = false; // Reset flag nếu có lỗi
            }
    };
        
    // Tải danh sách sản phẩm
    const loadProducts = async () => {
        try {
            console.log(`[${new Date().toISOString()}] Gọi api.getProducts()`);
            const products = await api.getProducts();
            loading.style.display = 'none';
            
            if (isExpired) return; // Không render nếu đã hết hạn
        
            productList.innerHTML = '';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.ImageUrl || 'https://via.placeholder.com/150'}" alt="${product.ProductName}">
                    <h4>${product.ProductName}</h4>
                    <p>${product.ProductDescription}</p>
                    <p><strong>Giá:</strong> ${product.ProductPrice.toLocaleString('vi-VN')} VNĐ</p>
                    <input type="number" min="0" value="${getProductQuantity(product.ProductID)}" data-product-id="${product.ProductID}">
                    <button class="btn btn-primary add-product" data-product-id="${product.ProductID}">Thêm vào giỏ</button>
                `;
                productList.appendChild(productCard);
            });

            // Xử lý thêm sản phẩm
            document.querySelectorAll('.add-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (isExpired) return; // Không cho thêm nếu đã hết hạn
                    
                    const productId = parseInt(e.target.getAttribute('data-product-id'));
                    const quantityInput = e.target.previousElementSibling;
                    const quantity = parseInt(quantityInput.value) || 0;

                    console.log(`[${new Date().toISOString()}] Thêm sản phẩm`, { productId, quantity });

                    const existingProductIndex = selectedProducts.findIndex(p => p.productId === productId);
                    if (existingProductIndex > -1) {
                        if (quantity === 0) {
                            selectedProducts.splice(existingProductIndex, 1);
                        } else {
                            selectedProducts[existingProductIndex].quantity = quantity;
                        }
                    } else if (quantity > 0) {
                        selectedProducts.push({ 
                            productId, 
                            quantity,
                            price: products.find(p => p.ProductID === productId).ProductPrice 
                        });
                    }
                    localStorage.setItem(`products_${bookingId}`, JSON.stringify(selectedProducts));
                    alert('Cập nhật giỏ hàng thành công!');
                });
            });
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải danh sách sản phẩm: ' + err.message;
            error.style.display = 'block';
            console.error(`[${new Date().toISOString()}] Lỗi tải sản phẩm`, err);
        }
    };

    // Lấy số lượng sản phẩm đã chọn
    function getProductQuantity(productId) {
        const product = selectedProducts.find(p => p.productId === parseInt(productId));
        return product ? product.quantity : 0;
    }

    // Lấy thời gian chờ
    let expirationTime;
    try {
        const holdResponse = JSON.parse(localStorage.getItem(`hold_${bookingId}`));
        if (!holdResponse || !holdResponse.expirationTime) {
            throw new Error('Dữ liệu hold không hợp lệ');
        }
        expirationTime = new Date(holdResponse.expirationTime).getTime();
        console.log(`[${new Date().toISOString()}] Thời gian chờ`, { expirationTime });
    } catch (err) {
        loading.style.display = 'none';
        error.textContent = 'Không thể lấy thời gian chờ: ' + err.message;
        error.style.display = 'block';
        console.error(`[${new Date().toISOString()}] Lỗi lấy thời gian chờ`, err);
        return;
    }

    // Đếm ngược thời gian chờ
    let countdownInterval = null;
    const updateCountdown = () => {
        if (isExpired) return; // Không cập nhật nếu đã hết hạn
        
        const now = new Date().getTime();
        const timeLeft = expirationTime - now;
        
        if (timeLeft <= 0) {
            countdownDiv.textContent = 'Hết thời gian chờ!';
            clearInterval(countdownInterval);
            handleExpiration();
                } else {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            countdownDiv.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    };
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    // Xử lý nút "Quay lại"
    backToSeatsBtn.addEventListener('click', async () => {
        if (isExpired || isCancelling) return;
        try {
            isCancelling = true;
            disableInteractions();
            console.log(`[${new Date().toISOString()}] Nhấn nút Quay lại, hủy booking ${bookingId}`);
            await api.cancelBooking(bookingId);
            localStorage.removeItem(`products_${bookingId}`);
            localStorage.removeItem(`hold_${bookingId}`);
            window.location.href = `seat-map.html?showId=${showId}&cinemaId=${cinemaId}`;
        } catch (err) {
            isCancelling = false;
            alert('Lỗi khi hủy đặt ghế: ' + err.message);
            console.error(`[${new Date().toISOString()}] Lỗi hủy booking`, err);
        }
    });

    // Xử lý nút "Tiếp tục thanh toán"
    proceedToPaymentBtn.addEventListener('click', () => {
        if (isExpired || isCancelling) return;
        console.log(`[${new Date().toISOString()}] Nhấn nút Tiếp tục thanh toán`, { bookingId, showId, cinemaId });
        window.location.href = `payment.html?bookingId=${bookingId}&showId=${showId}&cinemaId=${cinemaId}`;
    });

    // Chỉ gọi loadProducts một lần và kiểm tra trạng thái hết hạn
    if (!isExpired) {
        await loadProducts();
    }
});