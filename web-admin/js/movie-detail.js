import api from './api.js';

function getImageSrc(imageUrl) {
    if (!imageUrl) return 'https://via.placeholder.com/300x450';
    if (imageUrl.startsWith('data:image')) return imageUrl;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (typeof imageUrl === 'string' && imageUrl.length > 100) {
        return `data:image/jpeg;base64,${imageUrl}`;
    }
    return `/assets/images/${imageUrl}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const movieDetail = document.getElementById('movieDetail');
    const editForm = document.getElementById('editForm');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const imageFile = document.getElementById('imageFile');
    const imagePreview = document.getElementById('imagePreview');
    const cinemaSelect = document.getElementById('cinemaSelect');
    const cinemaId = localStorage.getItem('selectedCinema');

    // Xử lý preview ảnh khi chọn file
    imageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

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

    const loadMovie = async () => {
        if (!movieId) {
            editForm.style.display = 'block';
            loading.style.display = 'none';
            return;
        }

        try {
            loading.style.display = 'block';
            const movie = await api.getMovieById(movieId);
            
            // Cập nhật form với dữ liệu phim
            document.getElementById('title').value = movie.MovieTitle || '';
            document.getElementById('description').value = movie.MovieDescription || '';
            document.getElementById('language').value = movie.MovieLanguage || '';
            document.getElementById('genre').value = movie.MovieGenre || '';
            document.getElementById('releaseDate').value = movie.MovieReleaseDate ? new Date(movie.MovieReleaseDate).toISOString().split('T')[0] : '';
            document.getElementById('runtime').value = movie.MovieRuntime || '';
            document.getElementById('actor').value = movie.MovieActor || '';
            document.getElementById('director').value = movie.MovieDirector || '';
            document.getElementById('age').value = movie.MovieAge || 'P';
            document.getElementById('trailer').value = movie.MovieTrailer || '';

            // Hiển thị ảnh preview nếu có
            if (movie.ImageUrl) {
                imagePreview.src = getImageSrc(movie.ImageUrl);
                imagePreview.style.display = 'block';
            }

            loading.style.display = 'none';
            editForm.style.display = 'block';
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải thông tin phim: ' + err.message;
            error.style.display = 'block';
        }
    };

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loading.style.display = 'block';
        error.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('MovieTitle', document.getElementById('title').value);
            formData.append('MovieDescription', document.getElementById('description').value);
            formData.append('MovieLanguage', document.getElementById('language').value);
            formData.append('MovieGenre', document.getElementById('genre').value);
            formData.append('MovieReleaseDate', document.getElementById('releaseDate').value);
            formData.append('MovieRuntime', document.getElementById('runtime').value);
            formData.append('MovieActor', document.getElementById('actor').value);
            formData.append('MovieDirector', document.getElementById('director').value);
            formData.append('MovieAge', document.getElementById('age').value);
            formData.append('MovieTrailer', document.getElementById('trailer').value);

            if (imageFile.files[0]) {
                formData.append('image', imageFile.files[0]);
            }

            if (movieId) {
                await api.updateMovie(movieId, formData);
                alert('Cập nhật phim thành công!');
            } else {
                await api.addMovie(formData);
                alert('Thêm phim mới thành công!');
            }

            window.location.href = 'movies.html';
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi lưu phim: ' + err.message;
            error.style.display = 'block';
        }
    });

    await loadCinemas();
    await loadMovie();
});