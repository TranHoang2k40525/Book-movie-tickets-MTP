import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Khởi tạo các biến DOM
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyFilter');
    let revenueChart = null;
    let ticketChart = null;

    // Khởi tạo ngày mặc định (7 ngày gần nhất)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    startDateInput.value = sevenDaysAgo.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];

    // Hàm format tiền VNĐ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Hàm tạo biểu đồ doanh thu
    const createRevenueChart = (dates, revenues) => {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        if (revenueChart) {
            revenueChart.destroy();
        }
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: revenues,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => formatCurrency(context.parsed.y)
                        }
                    }
                }
            }
        });
    };

    // Hàm tạo biểu đồ số vé bán
    const createTicketChart = (dates, tickets) => {
        const ctx = document.getElementById('ticketChart').getContext('2d');
        if (ticketChart) {
            ticketChart.destroy();
        }
        ticketChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Số vé bán ra',
                    data: tickets,
                    backgroundColor: 'rgb(54, 162, 235)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    };

    // Hàm cập nhật bảng thống kê chi tiết
    const updateRevenueTable = (cinemaStats) => {
        const tbody = document.querySelector('#revenueTable tbody');
        tbody.innerHTML = '';
        
        cinemaStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.cinemaName}</td>
                <td>${stat.totalTickets}</td>
                <td>${formatCurrency(stat.ticketRevenue)}</td>
                <td>${formatCurrency(stat.comboRevenue)}</td>
                <td>${formatCurrency(stat.totalRevenue)}</td>
            `;
            tbody.appendChild(row);
        });
    };

    // Hàm tải và hiển thị dữ liệu thống kê
    const loadStatistics = async () => {
        try {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            // Lấy dữ liệu doanh thu
            const revenueStats = await api.getRevenueStats(startDate, endDate);
            const ticketStats = await api.getTicketStats(startDate, endDate);

            // Cập nhật thống kê tổng quan
            document.getElementById('totalRevenue').textContent = formatCurrency(revenueStats.totalRevenue || 0);
            document.getElementById('totalTickets').textContent = ticketStats.totalTickets || 0;
            document.getElementById('newCustomers').textContent = revenueStats.newCustomers || 0;

            // Tạo biểu đồ
            createRevenueChart(revenueStats.dates, revenueStats.revenues);
            createTicketChart(ticketStats.dates, ticketStats.tickets);

            // Cập nhật bảng chi tiết
            updateRevenueTable(revenueStats.cinemaStats || []);

        } catch (err) {
            console.error('Lỗi khi tải dữ liệu thống kê:', err);
            alert('Không thể tải dữ liệu thống kê: ' + err.message);
        }
    };

    // Xử lý sự kiện lọc
    applyFilterBtn.addEventListener('click', loadStatistics);

    // Kiểm tra đăng nhập và tải dữ liệu ban đầu
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    await loadStatistics();
});