import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const movieDetail = document.getElementById('movieDetail');
    const editForm = document.getElementById('editForm');

    try {
        const data = await api.getMovieById(movieId);
        const movie = data.movie;
        movieDetail.innerHTML = `
            <h2>${movie.MovieTitle}</h2>
            <p>Mô tả: ${movie.MovieDescription}</p>
            <p>Ngôn ngữ: ${movie.MovieLanguage}</p>
            <p>Thể loại: ${movie.MovieGenre}</p>
            <p>Ngày phát hành: ${movie.MovieReleaseDate}</p>
            <p>Thời lượng: ${movie.MovieRuntime} phút</p>
            <p>Diễn viên: ${movie.MovieActor}</p>
            <p>Đạo diễn: ${movie.MovieDirector}</p>
            <p>Độ tuổi: ${movie.MovieAge}</p>
            <p>Trailer: <a href="${movie.MovieTrailer}">${movie.MovieTrailer}</a></p>
            <img src="${movie.ImageUrl}" alt="${movie.MovieTitle}">
        `;

        editForm.innerHTML = `
            <input type="text" id="title" value="${movie.MovieTitle}">
            <textarea id="description">${movie.MovieDescription}</textarea>
            <input type="text" id="language" value="${movie.MovieLanguage}">
            <input type="text" id="genre" value="${movie.MovieGenre}">
            <input type="date" id="releaseDate" value="${movie.MovieReleaseDate}">
            <input type="number" id="runtime" value="${movie.MovieRuntime}">
            <input type="text" id="imageUrl" value="${movie.ImageUrl}">
            <input type="text" id="actor" value="${movie.MovieActor}">
            <input type="text" id="director" value="${movie.MovieDirector}">
            <input type="text" id="age" value="${movie.MovieAge}">
            <input type="text" id="trailer" value="${movie.MovieTrailer}">
            <button type="submit">Lưu</button>
        `;

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedMovie = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                language: document.getElementById('language').value,
                genre: document.getElementById('genre').value,
                releaseDate: document.getElementById('releaseDate').value,
                runtime: document.getElementById('runtime').value,
                imageUrl: document.getElementById('imageUrl').value,
                actor: document.getElementById('actor').value,
                director: document.getElementById('director').value,
                age: document.getElementById('age').value,
                trailer: document.getElementById('trailer').value,
            };
            try {
                const result = await api.updateMovie(movieId, updatedMovie);
                if (result.message === 'Cập nhật phim thành công!') {
                    alert('Cập nhật thành công!');
                    window.location.reload();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Cập nhật thất bại!');
            }
        });
    } catch (error) {
        alert('Lấy thông tin phim thất bại!');
    }
});