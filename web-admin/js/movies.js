import api from './api.js';

// Hàm chuẩn hóa chuỗi tiếng Việt
function normalizeString(str) {
    if (!str) return '';
    return str.normalize('NFC').replace(/[^\w\sàáảãạăắẳẵặằâấẩẫậèéẻẽẹêếểễệìíỉĩịòóỏõọôốổỗộơớởỡợùúủũụưứửữựỳýỷỹỵđ]/g, '');
}



// Hàm kiểm tra và lấy src ảnh hợp lệ (hỗ trợ base64, data:image, đường dẫn, tên file)
function getImageSrc(imageUrl) {
    if (!imageUrl) return 'https://via.placeholder.com/250';
    if (imageUrl.startsWith('data:image')) return imageUrl;
    if (/^[A-Za-z0-9+/=]+$/.test(imageUrl) && imageUrl.length > 100) {
        // Chuỗi base64 không có tiền tố
        return `data:image/png;base64,${imageUrl}`;
    }
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
    // Nếu chỉ là tên file
    return `/assets/ImageUrl/${imageUrl}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const movieList = document.getElementById('movieList');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const cinemaSelect = document.getElementById('cinemaSelect');
    let cinemaId = localStorage.getItem('selectedCinema');

    const loadCinemas = async () => {
        try {
            const data = await api.getCinemas();
            cinemaSelect.innerHTML = '<option value="">Chọn rạp</option>';
            data.cinemas.forEach(cinema => {
                const option = document.createElement('option');
                option.value = cinema.CinemaID;
                option.textContent = normalizeString(cinema.CinemaName);
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

    const loadMovies = async (cinemaId) => {
        if (!cinemaId) {
            movieList.innerHTML = '<p>Vui lòng chọn một rạp chiếu phim!</p>';
            loading.style.display = 'none';
            return;
        }
        loading.style.display = 'block';
        error.style.display = 'none';
        try {
            const data = await api.getMoviesByCinema(cinemaId);
            loading.style.display = 'none';
            if (data.length === 0) {
                movieList.innerHTML = '<p>Không có phim nào đang chiếu tại rạp này!</p>';
                return;
            }
            movieList.innerHTML = '';
            data.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.className = 'movie-card';
                movieElement.innerHTML = `
                    <div class="movie-poster">
                        <img src="${getImageSrc(movie.imageUrl)}" alt="${normalizeString(movie.title)}">
                        <div class="movie-status status-now-showing">Đang chiếu</div>
                    </div>
                    <div class="movie-details">
                        <h4 class="movie-title">${normalizeString(movie.title)}</h4>
                        <div class="movie-meta">
                            <p>Thể loại: ${normalizeString(movie.genre) || 'Không xác định'}</p>
                            <p>Thời gian chiếu: ${movie.showtimes[0]?.startTime || 'Chưa có lịch'}</p>
                            <p>Độ tuổi: ${normalizeString(movie.ageRating) || 'Không xác định'}</p>
                        </div>
                        <div class="button-group">
                            <button class="btn btn-primary" onclick="window.location.href='movie-detail.html?id=${movie.movieId}'">Chỉnh sửa</button>
                            <button class="btn btn-secondary" onclick="window.location.href='select-showtime.html?movieId=${movie.movieId}&cinemaId=${cinemaId}'">Đặt vé</button>
                        </div>
                    </div>
                `;
                movieList.appendChild(movieElement);
            });
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải danh sách phim: ' + err.message;
            error.style.display = 'block';
        }
    };

    cinemaSelect.addEventListener('change', (e) => {
        cinemaId = e.target.value;
        localStorage.setItem('selectedCinema', cinemaId);
        if (cinemaId) {
            loadMovies(cinemaId);
        } else {
            movieList.innerHTML = '<p>Vui lòng chọn một rạp chiếu phim!</p>';
            movieList.innerHTML = '';
        }
    });

    await loadCinemas();
    if (cinemaId) {
        await loadMovies(cinemaId);
    } else {
        movieList.innerHTML = '<p>Vui lòng chọn một rạp chiếu phim!</p>';
        loading.style.display = 'none';
    }
});