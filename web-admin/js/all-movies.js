import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const movieList = document.getElementById('movieList');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const modal = document.getElementById('movieFormModal');
    const form = document.getElementById('movieForm');
    const modalTitle = document.getElementById('modalTitle');
    const addMovieBtn = document.getElementById('addMovieBtn');
    const closeBtn = document.querySelector('.close');

    // Hàm hiển thị modal
    const showModal = (isEdit = false, movieData = null) => {
        modalTitle.textContent = isEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới';
        if (movieData) {
            document.getElementById('movieId').value = movieData.MovieID;
            document.getElementById('title').value = movieData.MovieTitle;
            document.getElementById('description').value = movieData.MovieDescription;
            document.getElementById('language').value = movieData.MovieLanguage;
            document.getElementById('genre').value = movieData.MovieGenre;
            document.getElementById('releaseDate').value = movieData.MovieReleaseDate.split('T')[0];
            document.getElementById('runtime').value = movieData.MovieRuntime;
            document.getElementById('imageUrl').value = movieData.ImageUrl;
            document.getElementById('actor').value = movieData.MovieActor;
            document.getElementById('director').value = movieData.MovieDirector;
            document.getElementById('age').value = movieData.MovieAge;
            document.getElementById('trailer').value = movieData.MovieTrailer || '';
        } else {
            form.reset();
            document.getElementById('movieId').value = '';
        }
        modal.style.display = 'block';
    };

    // Đóng modal
    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    // Load danh sách phim
    const loadMovies = async () => {
        loading.style.display = 'block';
        error.style.display = 'none';
        try {
            const response = await api.getAllMovies();
            loading.style.display = 'none';
            
            if (!response.movies || response.movies.length === 0) {
                movieList.innerHTML = '<p class="no-data">Không có phim nào.</p>';
                return;
            }

            movieList.innerHTML = '';
            response.movies.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.innerHTML = `
                    <div class="movie-poster">
                        <img src="${movie.ImageUrl || 'https://via.placeholder.com/150'}" alt="${movie.MovieTitle}">
                    </div>
                    <div class="movie-details">
                        <h4>${movie.MovieTitle}</h4>
                        <p><strong>Thể loại:</strong> ${movie.MovieGenre}</p>
                        <p><strong>Thời lượng:</strong> ${movie.MovieRuntime} phút</p>
                        <p><strong>Khởi chiếu:</strong> ${new Date(movie.MovieReleaseDate).toLocaleDateString('vi-VN')}</p>
                        <div class="movie-actions">
                            <button class="btn btn-primary edit-movie" data-id="${movie.MovieID}">
                                <i class="fas fa-edit"></i> Sửa
                            </button>
                            <button class="btn btn-danger delete-movie" data-id="${movie.MovieID}">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                `;
                movieList.appendChild(movieCard);
            });

            // Gắn sự kiện cho các nút
            document.querySelectorAll('.edit-movie').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const movieId = e.target.closest('button').dataset.id;
                    try {
                        const response = await api.getMovieById(movieId);
                        showModal(true, response.movie);
                    } catch (err) {
                        alert('Không thể tải thông tin phim: ' + err.message);
                    }
                });
            });

            document.querySelectorAll('.delete-movie').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (!confirm('Bạn có chắc muốn xóa phim này?')) return;
                    
                    const movieId = e.target.closest('button').dataset.id;
                    try {
                        await api.deleteMovie(movieId);
                        await loadMovies();
                    } catch (err) {
                        alert('Không thể xóa phim: ' + err.message);
                    }
                });
            });
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Lỗi khi tải danh sách phim: ' + err.message;
            error.style.display = 'block';
        }
    };

    // Xử lý submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const movieId = document.getElementById('movieId').value;
        const movieData = {
            MovieTitle: document.getElementById('title').value,
            MovieDescription: document.getElementById('description').value,
            MovieLanguage: document.getElementById('language').value,
            MovieGenre: document.getElementById('genre').value,
            MovieReleaseDate: document.getElementById('releaseDate').value,
            MovieRuntime: parseInt(document.getElementById('runtime').value),
            ImageUrl: document.getElementById('imageUrl').value,
            MovieActor: document.getElementById('actor').value,
            MovieDirector: document.getElementById('director').value,
            MovieAge: document.getElementById('age').value,
            MovieTrailer: document.getElementById('trailer').value
        };

        try {
            if (movieId) {
                await api.updateMovie(movieId, movieData);
            } else {
                await api.addMovie(movieData);
            }
            closeModal();
            await loadMovies();
        } catch (err) {
            alert('Lỗi khi lưu phim: ' + err.message);
        }
    });

    // Sự kiện đóng modal
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Sự kiện mở modal thêm phim
    addMovieBtn.addEventListener('click', () => showModal());

    // Kiểm tra đăng nhập và tải dữ liệu ban đầu
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    await loadMovies();
});