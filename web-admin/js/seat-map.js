import api from './api.js';

const seatColors = {
    booked: '#A67C52',
    reserved: '#FFA500',
    selected: '#0047AB',
    vip: '#EF4444',
    regular: '#D3D3D3',
    sweetbox: '#FF00FF',
    aisle: 'transparent'
};

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get('showId');
    const cinemaId = urlParams.get('cinemaId');
    const seatLayout = document.getElementById('seatLayout');
    const selectedSeatsDiv = document.getElementById('selectedSeats');
    const bookTicketsBtn = document.getElementById('bookTickets');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    // Lưu { seatId, seatNumber } để gửi seatId và hiển thị seatNumber
    let selectedSeats = [];

    if (!showId || !cinemaId) {
        loading.style.display = 'none';
        error.textContent = 'Thiếu thông tin suất chiếu hoặc rạp!';
        error.style.display = 'block';
        return;
    }

    const updateSelectedSeats = () => {
        // Hiển thị seatNumber trong giao diện
        const seatNumbers = selectedSeats.map(seat => seat.seatNumber);
        selectedSeatsDiv.innerHTML = seatNumbers.length > 0
            ? `<p><strong>Ghế đang chọn:</strong> ${seatNumbers.join(', ')}</p>`
            : '';
        document.getElementById('bookingAction').style.display = seatNumbers.length > 0 ? 'block' : 'none';
    };

    const validateSeatSelection = () => {
        const rowHSeats = selectedSeats.filter(seat => seat.seatNumber.startsWith('H'));
        if (rowHSeats.length > 0 && rowHSeats.length % 2 !== 0) {
            alert('Ghế ở hàng H phải được chọn đủ 2 ghế!');
            return false;
        }
        return true;
    };

    const renderSeatMap = async () => {
        try {
            const data = await api.getSeatMapByShow(showId);
            loading.style.display = 'none';
            seatLayout.innerHTML = '<div class="screen">Màn hình</div>';
            data.seatLayout.forEach(row => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'seat-row';
                row.seats.forEach(seat => {
                    const seatDiv = document.createElement('div');
                    seatDiv.className = `seat ${seat.status || seat.type}`;
                    seatDiv.textContent = seat.seatNumber;
                    seatDiv.style.backgroundColor = seatColors[seat.status] || seatColors[seat.type];
                    seatDiv.title = `${seat.seatNumber} (${seat.status || seat.type})`;
                    seatDiv.style.cursor = seat.status === 'booked' || seat.status === 'reserved' ? 'not-allowed' : 'pointer';

                    if (seat.status !== 'booked' && seat.status !== 'reserved') {
                        seatDiv.addEventListener('click', () => {
                            const seatObj = { seatId: seat.seatId, seatNumber: seat.seatNumber };
                            const index = selectedSeats.findIndex(s => s.seatId === seat.seatId);
                            if (index > -1) {
                                selectedSeats.splice(index, 1);
                                seatDiv.classList.remove('selected');
                                seatDiv.style.backgroundColor = seatColors[seat.type];
                            } else {
                                selectedSeats.push(seatObj);
                                seatDiv.classList.add('selected');
                                seatDiv.style.backgroundColor = seatColors.selected;
                            }
                            updateSelectedSeats();
                        });
                    }
                    rowDiv.appendChild(seatDiv);
                });
                seatLayout.appendChild(rowDiv);
            });
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải sơ đồ ghế: ' + err.message;
            error.style.display = 'block';
        }
    };

    await renderSeatMap();

    // Kết nối WebSocket
    api.connectWebSocket(showId, renderSeatMap);

    // Xử lý đặt vé
    bookTicketsBtn.addEventListener('click', async () => {
        if (selectedSeats.length === 0) {
            alert('Vui lòng chọn ít nhất một ghế!');
            return;
        }
        if (!validateSeatSelection()) {
            return;
        }
        try {
            // Gửi seatId thay vì seatNumber
            const seatIds = selectedSeats.map(seat => seat.seatId);
            console.log('Sending holdSeats request:', { showId, seatIds });
            const response = await api.holdSeats(showId, seatIds);
            localStorage.setItem(`hold_${response.bookingId}`, JSON.stringify(response));
            window.location.href = `select-products.html?showId=${showId}&bookingId=${response.bookingId}&cinemaId=${cinemaId}`;
        } catch (err) {
            error.textContent = 'Lỗi khi giữ ghế: ' + err.message;
            error.style.display = 'block';
        }
    });
});