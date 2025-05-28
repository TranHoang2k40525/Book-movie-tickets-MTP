import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    const cinemaId = urlParams.get('cinemaId');
    const showtimeList = document.getElementById('showtimeList');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const cinemaSelect = document.getElementById('cinemaSelect');

    if (!movieId || !cinemaId) {
        loading.style.display = 'none';
        error.textContent = 'Thiếu thông tin phim hoặc rạp!';
        error.style.display = 'block';
        return;
    }

    const loadCinemas = async () => {
        try {
            const data = await api.getCinemas();
            cinemaSelect.innerHTML = '<option value="">Chọn rạp</option>';
            data.cinemas.forEach(cinema => {
                const option = document.createElement('option');
                option.value = cinema.CinemaID;
                option.textContent = cinema.CinemaName;
                if (cinema.CinemaID == cinemaId) {
                    option.selected = true;
                }
                cinemaSelect.appendChild(option);
            });
        } catch (err) {
            error.textContent = 'Lỗi khi tải danh sách rạp!';
            error.style.display = 'block';
        }
    };

    const loadShowtimes = async (movieId, cinemaId) => {
        loading.style.display = 'block';
        error.style.display = 'none';
        try {
            const data = await api.getShowtimesByMovieId(movieId);
            const filteredShowtimes = data.showtimes.filter(showtime => showtime.CinemaID == cinemaId);
            loading.style.display = 'none';
            if (!filteredShowtimes || filteredShowtimes.length === 0) {
                showtimeList.innerHTML = '<p>Không có suất chiếu nào cho phim này tại rạp đã chọn!</p>';
                return;
            }

            showtimeList.innerHTML = '';
            filteredShowtimes.forEach(showtime => {
                const showtimeCard = document.createElement('div');
                showtimeCard.className = 'showtime-card';
                showtimeCard.innerHTML = `
                    <div class="showtime-details">
                        <h4 class="showtime-title">${showtime.CinemaName} - ${showtime.HallName}</h4>
                        <div class="showtime-meta">
                            <p><i class="fas fa-calendar-alt"></i> Ngày: ${showtime.ShowDate}</p>
                            <p><i class="fas fa-clock"></i> Giờ: ${showtime.ShowTime}</p>
                        </div>
                        <button class="btn btn-primary" onclick="window.location.href='seat-map.html?showId=${showtime.ShowID}&cinemaId=${cinemaId}'">
                            Chọn ghế
                        </button>
                    </div>
                `;
                showtimeList.appendChild(showtimeCard);
            });
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải danh sách suất chiếu: ' + err.message;
            error.style.display = 'block';
        }
    };

    cinemaSelect.addEventListener('change', (e) => {
        const newCinemaId = e.target.value;
        if (newCinemaId) {
            localStorage.setItem('selectedCinema', newCinemaId);
            window.location.href = `select-showtime.html?movieId=${movieId}&cinemaId=${newCinemaId}`;
        }
    });

    await loadCinemas();
    await loadShowtimes(movieId, cinemaId);
});