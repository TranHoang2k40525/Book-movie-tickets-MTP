import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const paymentDetailsDiv = document.getElementById('paymentDetails');
    const paymentForm = document.getElementById('paymentForm');
    const qrCodeSection = document.getElementById('qrCodeSection');
    const successSection = document.getElementById('successSection');
    const countdownDiv = document.getElementById('countdown');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    const backToProductsBtn = document.getElementById('backToProducts');
    const simulatePaymentBtn = document.getElementById('simulatePayment');
    const cancelPaymentBtn = document.getElementById('cancelPayment');
    const printInvoiceBtn = document.getElementById('printInvoice');
    const backToSeatsBtn = document.getElementById('backToSeats');
    const qrCodeImg = document.getElementById('qrCode');
    const transactionInfoDiv = document.getElementById('transactionInfo');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const termsAcceptedCheckbox = document.getElementById('termsAccepted');

    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get('showId');
    const bookingId = urlParams.get('bookingId');
    const cinemaId = urlParams.get('cinemaId');

    if (!showId || !bookingId || !cinemaId) {
        loading.style.display = 'none';
        error.textContent = 'Thiếu thông tin suất chiếu hoặc đặt vé!';
        error.style.display = 'block';
        return;
    }

    let selectedProducts = JSON.parse(localStorage.getItem(`products_${bookingId}`)) || [];
    let voucherId = null; // Có thể thêm logic chọn voucher nếu cần

    // Lấy thời gian chờ từ localStorage
    let expirationTime;
    try {
        const holdResponse = JSON.parse(localStorage.getItem(`hold_${bookingId}`));
        expirationTime = new Date(holdResponse.expirationTime).getTime();
    } catch (err) {
        error.textContent = 'Không thể lấy thời gian chờ!';
        error.style.display = 'block';
        return;
    }

    // Đếm ngược thời gian chờ
    const updateCountdown = () => {
        const now = new Date().getTime();
        const timeLeft = expirationTime - now;
        if (timeLeft <= 0) {
            countdownDiv.textContent = 'Hết thời gian chờ!';
            api.cancelBooking(bookingId).then(() => {
                window.location.href = `seat-map.html?showId=${showId}&cinemaId=${cinemaId}`;
            });
        } else {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            countdownDiv.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    };
    setInterval(updateCountdown, 1000);

    // Hủy ghế khi thoát trang
    window.addEventListener('beforeunload', async (event) => {
        if (!successSection.style.display === 'block') {
            await api.cancelBooking(bookingId);
        }
    });

    // Tải chi tiết thanh toán
    const loadPaymentDetails = async () => {
        try {
            const response = await api.getPaymentDetails(bookingId);
            const data = response.data;
            const booking = data.booking;
            const products = data.products;

            let seatTotalPrice = parseFloat(booking.SeatTotalPrice) || 0;
            let productTotalPrice = products.reduce((sum, p) => sum + parseFloat(p.TotalPriceBookingProduct), 0);
            let totalPrice = seatTotalPrice + productTotalPrice;

            paymentDetailsDiv.innerHTML = `
                <h3>Thông tin vé</h3>
                <p><strong>Mã đặt vé:</strong> ${booking.BookingID}</p>
                <p><strong>Phim:</strong> ${booking.MovieTitle}</p>
                <p><strong>Rạp:</strong> ${booking.CinemaName}</p>
                <p><strong>Phòng:</strong> ${booking.HallName}</p>
                <p><strong>Ngày chiếu:</strong> ${new Date(booking.ShowDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Giờ chiếu:</strong> ${booking.ShowTime}</p>
                <p><strong>Ghế:</strong> ${booking.SelectedSeats}</p>
                <p><strong>Tổng tiền vé:</strong> ${seatTotalPrice.toLocaleString('vi-VN')} VNĐ</p>
                ${products.length > 0 ? `
                    <h3>Sản phẩm</h3>
                    <ul>
                        ${products.map(p => `
                            <li>${p.ProductName} x${p.Quantity} - ${p.TotalPriceBookingProduct.toLocaleString('vi-VN')} VNĐ</li>
                        `).join('')}
                    </ul>
                    <p><strong>Tổng tiền sản phẩm:</strong> ${productTotalPrice.toLocaleString('vi-VN')} VNĐ</p>
                ` : ''}
                <h3>Tổng thanh toán: ${totalPrice.toLocaleString('vi-VN')} VNĐ</h3>
            `;
            loading.style.display = 'none';
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải chi tiết thanh toán: ' + err.message;
            error.style.display = 'block';
        }
    };
    await loadPaymentDetails();

    // Xử lý xác nhận thanh toán
    confirmPaymentBtn.addEventListener('click', async () => {
        const paymentMethod = paymentMethodSelect.value;
        if (!termsAcceptedCheckbox.checked) {
            alert('Vui lòng đồng ý với các điều khoản!');
            return;
        }
        try {
            const qrResponse = await api.generateQRCode(bookingId, paymentMethod, selectedProducts, voucherId);
            if (qrResponse.success) {
                paymentForm.style.display = 'none';
                qrCodeSection.style.display = 'block';
                qrCodeImg.src = qrResponse.qrCode;
                transactionInfoDiv.innerHTML = `
                    <p><strong>Ngân hàng:</strong> ${qrResponse.transactionInfo.bankName}</p>
                    <p><strong>Số tài khoản:</strong> ${qrResponse.transactionInfo.accountNumber}</p>
                    <p><strong>Chủ tài khoản:</strong> ${qrResponse.transactionInfo.accountName}</p>
                    <p><strong>Số tiền:</strong> ${qrResponse.transactionInfo.amount.toLocaleString('vi-VN')} VNĐ</p>
                    <p><strong>Nội dung:</strong> ${qrResponse.transactionInfo.content}</p>
                `;
            } else {
                error.textContent = qrResponse.message;
                error.style.display = 'block';
            }
        } catch (err) {
            error.textContent = 'Lỗi khi sinh mã QR: ' + err.message;
            error.style.display = 'block';
        }
    });

    // Xử lý giả lập thanh toán
    simulatePaymentBtn.addEventListener('click', async () => {
        try {
            const paymentResponse = await api.simulateMomoPayment(bookingId, selectedProducts, voucherId);
            if (paymentResponse.success) {
                qrCodeSection.style.display = 'none';
                successSection.style.display = 'block';
                localStorage.removeItem(`products_${bookingId}`);
                localStorage.removeItem(`hold_${bookingId}`);
            } else {
                error.textContent = paymentResponse.message;
                error.style.display = 'block';
            }
        } catch (err) {
            error.textContent = 'Lỗi khi giả lập thanh toán: ' + err.message;
            error.style.display = 'block';
        }
    });

    // Xử lý in hóa đơn
    printInvoiceBtn.addEventListener('click', () => {
        const element = paymentDetailsDiv.cloneNode(true);
        element.style.padding = '20px';
        element.style.backgroundColor = '#fff';
        element.style.color = '#000';
        html2pdf().from(element).save(`HoaDon_${bookingId}.pdf`);
    });

    // Xử lý hủy thanh toán hoặc quay lại
    const cancelActions = [backToProductsBtn, cancelPaymentBtn, backToSeatsBtn];
    cancelActions.forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await api.cancelBooking(bookingId);
                localStorage.removeItem(`products_${bookingId}`);
                localStorage.removeItem(`hold_${bookingId}`);
                window.location.href = `seat-map.html?showId=${showId}&cinemaId=${cinemaId}`;
            } catch (err) {
                alert('Lỗi khi hủy đặt vé: ' + err.message);
            }
        });
    });
});