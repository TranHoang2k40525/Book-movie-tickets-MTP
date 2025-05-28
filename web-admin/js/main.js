import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const cinemaList = document.getElementById('cinemaList');

    // Hàm format tiền VNĐ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Hàm load thống kê tổng quan
    const loadDashboardStats = async () => {
        try {
            const stats = await api.getDashboardStats();
            
            document.getElementById('totalCinemas').textContent = stats.totalCinemas || 0;
            document.getElementById('totalMovies').textContent = stats.totalMovies || 0;
            document.getElementById('todayRevenue').textContent = formatCurrency(stats.todayRevenue || 0);
            document.getElementById('todayTickets').textContent = stats.todayTickets || 0;
        } catch (err) {
            console.error('Lỗi khi tải thống kê:', err);
            error.textContent = 'Không thể tải dữ liệu thống kê';
            error.style.display = 'block';
        }
    };

    // Hàm load danh sách rạp
    const loadCinemas = async () => {
        loading.style.display = 'block';
        error.style.display = 'none';
        try {
            const data = await api.getCinemas();
            loading.style.display = 'none';
            
            if (!data.cinemas || data.cinemas.length === 0) {
                cinemaList.innerHTML = '<p class="no-data">Không có rạp nào.</p>';
                return;
            }

            cinemaList.innerHTML = '';
            data.cinemas.forEach(cinema => {
                const cinemaCard = document.createElement('div');
                cinemaCard.className = 'cinema-card';
                cinemaCard.innerHTML = `
                    <div class="cinema-info">
                        <h3 class="cinema-name">${cinema.CinemaName}</h3>
                        <p class="cinema-address">${cinema.CityAddress || 'Chưa có địa chỉ'}</p>
                        <div class="cinema-stats">
                            <span><i class="fas fa-chair"></i> ${cinema.TotalSeats || 0} ghế</span>
                            <span><i class="fas fa-door-open"></i> ${cinema.Halls || 0} phòng</span>
                        </div>
                    </div>
                    <div class="cinema-actions">
                        <button class="btn btn-primary" onclick="window.location.href='movies.html?cinemaId=${cinema.CinemaID}'">
                            Xem phim
                        </button>
                    </div>
                `;
                cinemaList.appendChild(cinemaCard);
            });
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải danh sách rạp: ' + err.message;
            error.style.display = 'block';
            console.error('Lỗi khi tải danh sách rạp:', err);
        }
    };

    // Kiểm tra đăng nhập
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    // Load dữ liệu
    await Promise.all([
        loadDashboardStats(),
        loadCinemas()
    ]);

    // Auto refresh mỗi 5 phút
    setInterval(async () => {
        await loadDashboardStats();
    }, 300000); // 5 phút = 300000ms
});