import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const data = await api.login(email, password);
                if (data.accessToken) {
                    localStorage.setItem('token', data.accessToken);
                    window.location.href = 'main.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Đăng nhập thất bại!');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const data = await api.register(email, password);
                if (data.message === 'Đăng ký thành công!') {
                    window.location.href = 'index.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Đăng ký thất bại!');
            }
        });
    }
});