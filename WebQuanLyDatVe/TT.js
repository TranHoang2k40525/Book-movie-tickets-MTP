// Sample movie data (for demo purposes)
let movies = [
    {
        id: 1,
        title: "Avengers: Endgame",
        duration: 181,
        director: "Anthony Russo, Joe Russo",
        actors: "Robert Downey Jr., Chris Evans",
        genre: "Action, Sci-Fi",
        releaseDate: "2025-04-26",
        status: "nowShowing",
        rating: 9.2,
        description: "The epic conclusion to the Infinity Saga.",
        poster: "/api/placeholder/250/350"
    },
    {
        id: 2,
        title: "Black Widow",
        duration: 134,
        director: "Cate Shortland",
        actors: "Scarlett Johansson, Florence Pugh",
        genre: "Action, Adventure",
        releaseDate: "2025-07-09",
        status: "nowShowing",
        rating: 8.5,
        description: "Natasha Romanoff confronts her past.",
        poster: "/api/placeholder/250/350"
    },
    {
        id: 3,
        title: "Spider-Man: No Way Home",
        duration: 148,
        director: "Jon Watts",
        actors: "Tom Holland, Zendaya",
        genre: "Action, Adventure",
        releaseDate: "2025-12-17",
        status: "comingSoon",
        rating: 9.0,
        description: "Peter Parker faces multiversal threats.",
        poster: "/api/placeholder/250/350"
    },
    {
        id: 4,
        title: "Doctor Strange 2",
        duration: 126,
        director: "Sam Raimi",
        actors: "Benedict Cumberbatch, Elizabeth Olsen",
        genre: "Action, Fantasy",
        releaseDate: "2025-05-06",
        status: "nowShowing",
        rating: 8.7,
        description: "Doctor Strange explores the multiverse.",
        poster: "/api/placeholder/250/350"
    }
];

// Sample screenings data (for demo purposes, all in 2025)
let screenings = [
    {
        id: 1,
        movieId: 1,
        room: "Phòng 1",
        date: "2025-04-29",
        startTime: "10:00",
        endTime: "13:00",
        status: "almostFull",
        price: 90000
    },
    {
        id: 2,
        movieId: 2,
        room: "Phòng 2",
        date: "2025-04-29",
        startTime: "10:30",
        endTime: "12:45",
        status: "available",
        price: 85000
    },
    {
        id: 3,
        movieId: 4,
        room: "Phòng 3",
        date: "2025-05-01",
        startTime: "13:00",
        endTime: "15:00",
        status: "full",
        price: 90000
    },
    {
        id: 4,
        movieId: 2,
        room: "Phòng 2",
        date: "2025-05-02",
        startTime: "15:30",
        endTime: "17:45",
        status: "available",
        price: 95000
    },
    {
        id: 5,
        movieId: 1,
        room: "Phòng 1",
        date: "2025-05-03",
        startTime: "19:00",
        endTime: "22:00",
        status: "available",
        price: 110000
    },
    {
        id: 6,
        movieId: 3,
        room: "Phòng 4",
        date: "2025-12-17",
        startTime: "14:00",
        endTime: "16:30",
        status: "available",
        price: 100000
    }
];

// Sample bookings data (for demo purposes)
let bookings = [
    {
        id: 1,
        screeningId: 1,
        customerName: "Nguyễn Văn A",
        customerPhone: "0901234567",
        adultTickets: 2,
        childTickets: 1,
        seats: ["A1", "A2", "A3"],
        totalPrice: 255000 // 2 * 90,000 + 1 * 75,000
    },
    {
        id: 2,
        screeningId: 2,
        customerName: "Trần Thị B",
        customerPhone: "0912345678",
        adultTickets: 1,
        childTickets: 0,
        seats: ["B5"],
        totalPrice: 85000 // 1 * 85,000
    },
    {
        id: 3,
        screeningId: 4,
        customerName: "Lê Văn C",
        customerPhone: "0923456789",
        adultTickets: 3,
        childTickets: 0,
        seats: ["C1", "C2", "C3"],
        totalPrice: 285000 // 3 * 95,000
    }
];

// Sample customers data (for demo purposes)
let customers = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        phone: "0901234567",
        email: "nguyenvana@example.com",
        status: "member",
        ticketsPurchased: 10,
        totalSpending: 900000
    },
    {
        id: 2,
        name: "Trần Thị B",
        phone: "0912345678",
        email: "tranthib@example.com",
        status: "member",
        ticketsPurchased: 5,
        totalSpending: 425000
    },
    {
        id: 3,
        name: "Lê Văn C",
        phone: "0923456789",
        email: "levanc@example.com",
        status: "member",
        ticketsPurchased: 15,
        totalSpending: 1425000
    },
    {
        id: 4,
        name: "Phạm Thị D",
        phone: "0934567890",
        email: "phamthid@example.com",
        status: "potential",
        ticketsPurchased: 0,
        totalSpending: 0
    }
];

// Sample report data (for demo purposes)
let revenueByGenre = [
    { genre: "Action", ticketsSold: 1500, revenue: 135000000, percentage: 45, period: "daily" },
    { genre: "Sci-Fi", ticketsSold: 800, revenue: 72000000, percentage: 24, period: "daily" },
    { genre: "Adventure", ticketsSold: 600, revenue: 54000000, percentage: 18, period: "daily" },
    { genre: "Fantasy", ticketsSold: 400, revenue: 36000000, percentage: 12, period: "daily" },
    { genre: "Action", ticketsSold: 45000, revenue: 4050000000, percentage: 48, period: "monthly" },
    { genre: "Sci-Fi", ticketsSold: 24000, revenue: 2160000000, percentage: 25, period: "monthly" },
    { genre: "Adventure", ticketsSold: 18000, revenue: 1620000000, percentage: 19, period: "monthly" },
    { genre: "Fantasy", ticketsSold: 12000, revenue: 1080000000, percentage: 13, period: "monthly" },
    { genre: "Action", ticketsSold: 540000, revenue: 48600000000, percentage: 50, period: "yearly" },
    { genre: "Sci-Fi", ticketsSold: 288000, revenue: 25920000000, percentage: 26, period: "yearly" },
    { genre: "Adventure", ticketsSold: 216000, revenue: 19440000000, percentage: 20, period: "yearly" },
    { genre: "Fantasy", ticketsSold: 144000, revenue: 12960000000, percentage: 14, period: "yearly" }
];

let salesByMonth = [
    { month: "Tháng 1", ticketsSold: 50000, revenue: 4500000000, growth: 0 },
    { month: "Tháng 2", ticketsSold: 52000, revenue: 4680000000, growth: 4 },
    { month: "Tháng 3", ticketsSold: 55000, revenue: 4950000000, growth: 5.77 },
    { month: "Tháng 4", ticketsSold: 60000, revenue: 5400000000, growth: 9.09 },
    { month: "Tháng 5", ticketsSold: 58000, revenue: 5220000000, growth: -3.33 },
    { month: "Tháng 6", ticketsSold: 0, revenue: 0, growth: 0 },
    { month: "Tháng 7", ticketsSold: 0, revenue: 0, growth: 0 },
    { month: "Tháng 8", ticketsSold: 0, revenue: 0, growth: 0 },
    { month: "Tháng 9", ticketsSold: 0, revenue: 0, growth: 0 },
    { month: "Tháng 10", ticketsSold: 0, revenue: 0, growth: 0 },
    { month: "Tháng 11", ticketsSold: 0, revenue: 0, growth: 0 },
    { month: "Tháng 12", ticketsSold: 0, revenue: 0, growth: 0 }
];

// Sample admin account data (for demo purposes)
let adminAccount = {
    username: "admin",
    email: "admin@cinemaadmin.com",
    password: "admin123" // Simulated password (not stored in plain text in a real system)
};

// Sample system settings data (for demo purposes)
let systemSettings = {
    cinemaName: "MTB Cinema",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    phone: "(84) 28 1234 5678",
    email: "support@cinemaadmin.com"
};

// Chart instances
let revenueChartInstance = null;
let salesChartInstance = null;

// Function to render revenue by genre
function renderRevenueByGenre(period = 'daily', genre = '') {
    const tableBody = document.querySelector('#revenueTable tbody');
    tableBody.innerHTML = '';

    let filteredRevenue = revenueByGenre.filter(item => {
        const isPeriodMatch = item.period === period;
        const isGenreMatch = genre ? item.genre === genre : true;
        return isPeriodMatch && isGenreMatch;
    });

    filteredRevenue.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.genre}</td>
            <td>${item.ticketsSold.toLocaleString()}</td>
            <td>${item.revenue.toLocaleString()}₫</td>
            <td>${item.percentage}%</td>
        `;
        tableBody.appendChild(row);
    });

    // Update revenue chart
    updateRevenueChart(filteredRevenue);
}

// Function to update revenue chart
function updateRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    // Destroy existing chart if it exists
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.genre),
            datasets: [{
                label: 'Doanh thu theo thể loại',
                data: data.map(item => item.revenue),
                backgroundColor: [
                    '#ff5722',
                    '#2ecc71',
                    '#f39c12',
                    '#3498db'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Phân bố doanh thu theo thể loại'
                }
            }
        }
    });
}

// Function to render sales by month
function renderSalesByMonth() {
    const tableBody = document.querySelector('#salesTable tbody');
    tableBody.innerHTML = '';

    salesByMonth.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.month}</td>
            <td>${item.ticketsSold.toLocaleString()}</td>
            <td>${item.revenue.toLocaleString()}₫</td>
            <td>${item.growth.toFixed(2)}%</td>
        `;
        tableBody.appendChild(row);
    });

    // Update sales chart
    updateSalesChart();
}

// Function to update sales chart
function updateSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Destroy existing chart if it exists
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesByMonth.map(item => item.month),
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: salesByMonth.map(item => item.revenue),
                backgroundColor: '#ff5722',
                borderColor: '#e64a19',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toLocaleString() + 'M';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Doanh thu theo tháng (2025)'
                }
            }
        }
    });
}

// Function to render settings
function renderSettings() {
    // Populate admin account form
    document.getElementById('adminUsername').value = adminAccount.username;
    document.getElementById('adminEmail').value = adminAccount.email;
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';

    // Populate system settings form
    document.getElementById('cinemaName').value = systemSettings.cinemaName;
    document.getElementById('cinemaAddress').value = systemSettings.address;
    document.getElementById('cinemaPhone').value = systemSettings.phone;
    document.getElementById('cinemaEmail').value = systemSettings.email;
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to render customers
function renderCustomers(filterName = '', filterStatus = '') {
    const tableBody = document.querySelector('#customersTable tbody');
    tableBody.innerHTML = '';

    let filteredCustomers = customers.filter(customer => {
        const isNameMatch = filterName ? customer.name.toLowerCase().includes(filterName.toLowerCase()) : true;
        const isStatusMatch = filterStatus ? customer.status === filterStatus : true;
        return isNameMatch && isStatusMatch;
    });

    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.email}</td>
            <td><span class="status-badge status-${customer.status}">${getCustomerStatusText(customer.status)}</span></td>
            <td>${customer.ticketsPurchased}</td>
            <td>${customer.totalSpending.toLocaleString()}₫</td>
            <td>
                <button class="btn btn-primary action-btn edit-customer" data-id="${customer.id}">Chỉnh sửa</button>
                <button class="btn btn-danger action-btn delete-customer" data-id="${customer.id}">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-customer').forEach(button => {
        button.addEventListener('click', function() {
            const customerId = this.dataset.id;
            editCustomer(customerId);
        });
    });

    document.querySelectorAll('.delete-customer').forEach(button => {
        button.addEventListener('click', function() {
            const customerId = this.dataset.id;
            deleteCustomer(customerId);
        });
    });
}

// Function to get customer status text
function getCustomerStatusText(status) {
    switch (status) {
        case 'member': return 'Thành viên';
        case 'potential': return 'Tiềm năng';
        default: return '';
    }
}

// Function to edit a customer
function editCustomer(customerId) {
    const customer = customers.find(c => c.id == customerId);
    if (customer) {
        document.getElementById('customerModalTitle').textContent = 'Chỉnh sửa khách hàng';
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerEmail').value = customer.email;
        document.getElementById('customerStatus').value = customer.status;
        document.getElementById('customerTickets').value = customer.ticketsPurchased;
        document.getElementById('customerSpending').value = customer.totalSpending;
        document.getElementById('addCustomerModal').style.display = 'flex';
    }
}

// Function to delete a customer
function deleteCustomer(customerId) {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        customers = customers.filter(c => c.id != customerId);
        renderCustomers(
            document.getElementById('filterCustomerName').value,
            document.getElementById('filterCustomerStatus').value
        );
        alert('Khách hàng đã được xóa.');
    }
}

// Function to render bookings
function renderBookings(filterMovieId = '', filterDate = '') {
    const tableBody = document.querySelector('#bookingsTable tbody');
    tableBody.innerHTML = '';

    let filteredBookings = bookings.filter(booking => {
        const screening = screenings.find(s => s.id == booking.screeningId);
        if (!screening) return false;
        const isMovieMatch = filterMovieId ? screening.movieId == filterMovieId : true;
        const isDateMatch = filterDate ? screening.date === filterDate : true;
        return isMovieMatch && isDateMatch;
    });

    filteredBookings.forEach(booking => {
        const screening = screenings.find(s => s.id == booking.screeningId);
        const movie = screening ? movies.find(m => m.id == screening.movieId) : null;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movie ? movie.title : 'Unknown'}</td>
            <td>${screening ? `${screening.room} - ${screening.date} ${screening.startTime}` : 'Unknown'}</td>
            <td>${booking.customerName || 'N/A'}</td>
            <td>${booking.customerPhone || 'N/A'}</td>
            <td>${booking.seats.join(', ')}</td>
            <td>Người lớn: ${booking.adultTickets}, Trẻ em: ${booking.childTickets}</td>
            <td>${booking.totalPrice.toLocaleString()}₫</td>
            <td>
                <button class="btn btn-primary action-btn edit-booking" data-id="${booking.id}">Chỉnh sửa</button>
                <button class="btn btn-danger action-btn cancel-booking" data-id="${booking.id}">Hủy</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for edit and cancel buttons
    document.querySelectorAll('.edit-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            editBooking(bookingId);
        });
    });

    document.querySelectorAll('.cancel-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            cancelBooking(bookingId);
        });
    });
}

// Function to edit a booking
function editBooking(bookingId) {
    const booking = bookings.find(b => b.id == bookingId);
    if (booking) {
        const screening = screenings.find(s => s.id == booking.screeningId);
        document.getElementById('bookingModalTitle').textContent = 'Chỉnh sửa vé';
        document.getElementById('bookingId').value = booking.id;
        document.getElementById('bookingMovie').value = screening.movieId;
        
        // Trigger change event to populate screening options
        const event = new Event('change');
        document.getElementById('bookingMovie').dispatchEvent(event);
        
        // Wait for screening options to populate
        setTimeout(() => {
            document.getElementById('bookingScreening').value = booking.screeningId;
            document.getElementById('customerName').value = booking.customerName || '';
            document.getElementById('customerPhone').value = booking.customerPhone || '';
            document.getElementById('adultTickets').value = booking.adultTickets;
            document.getElementById('childTickets').value = booking.childTickets;
            
            // Reset seat selection
            document.querySelectorAll('.seat.selected').forEach(seat => {
                seat.classList.remove('selected');
                seat.style.backgroundColor = '';
                seat.style.color = '';
            });
            
            // Mark booked seats
            booking.seats.forEach(seat => {
                const seatElement = document.querySelector(`.seat[data-seat="${seat}"]`);
                if (seatElement && !seatElement.classList.contains('booked')) {
                    seatElement.classList.add('selected');
                    seatElement.style.backgroundColor = '#2ecc71';
                    seatElement.style.color = 'white';
                }
            });
            
            document.getElementById('selectedSeats').value = booking.seats.join(', ');
            document.getElementById('totalPrice').value = booking.totalPrice.toLocaleString() + '₫';
            document.getElementById('quickBookingModal').style.display = 'flex';
        }, 0);
    }
}

// Function to cancel a booking
function cancelBooking(bookingId) {
    if (confirm('Bạn có chắc chắn muốn hủy vé này?')) {
        bookings = bookings.filter(b => b.id != bookingId);
        renderBookings(
            document.getElementById('filterBookingMovie').value,
            document.getElementById('filterBookingDate').value
        );
        alert('Vé đã được hủy.');
    }
}

// Function to render screenings
function renderScreenings(filterMovieId = '', filterDate = '') {
    const tableBody = document.querySelector('#screeningsTable tbody');
    tableBody.innerHTML = '';

    let filteredScreenings = screenings.filter(screening => {
        const isMovieMatch = filterMovieId ? screening.movieId == filterMovieId : true;
        const isDateMatch = filterDate ? screening.date === filterDate : true;
        return isMovieMatch && isDateMatch && screening.date.startsWith('2025');
    });

    filteredScreenings.forEach(screening => {
        const movie = movies.find(m => m.id == screening.movieId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movie ? movie.title : 'Unknown'}</td>
            <td>${screening.room}</td>
            <td>${screening.date}</td>
            <td>${screening.startTime} - ${screening.endTime}</td>
            <td><span class="status-badge status-${screening.status}">${getScreeningStatusText(screening.status)}</span></td>
            <td>${screening.price.toLocaleString()}₫</td>
            <td>
                <button class="btn btn-primary action-btn edit-screening" data-id="${screening.id}">Chỉnh sửa</button>
                <button class="btn btn-danger action-btn delete-screening" data-id="${screening.id}">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-screening').forEach(button => {
        button.addEventListener('click', function() {
            const screeningId = this.dataset.id;
            editScreening(screeningId);
        });
    });

    document.querySelectorAll('.delete-screening').forEach(button => {
        button.addEventListener('click', function() {
            const screeningId = this.dataset.id;
            deleteScreening(screeningId);
        });
    });
}

// Function to get screening status text
function getScreeningStatusText(status) {
    switch (status) {
        case 'available': return 'Còn chỗ';
        case 'almostFull': return 'Sắp đầy';
        case 'full': return 'Đầy';
        default: return '';
    }
}

// Function to edit a screening
function editScreening(screeningId) {
    const screening = screenings.find(s => s.id == screeningId);
    if (screening) {
        document.getElementById('screeningModalTitle').textContent = 'Chỉnh sửa suất chiếu';
        document.getElementById('screeningId').value = screening.id;
        document.getElementById('screeningMovie').value = screening.movieId;
        document.getElementById('screeningRoom').value = screening.room.replace('Phòng ', '');
        document.getElementById('screeningDate').value = screening.date;
        document.getElementById('screeningStartTime').value = screening.startTime;
        document.getElementById('screeningEndTime').value = screening.endTime;
        document.getElementById('screeningPrice').value = screening.price;
        document.getElementById('screeningStatus').value = screening.status;
        document.getElementById('addScreeningModal').style.display = 'flex';
    }
}

// Function to delete a screening
function deleteScreening(screeningId) {
    if (confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
        screenings = screenings.filter(s => s.id != screeningId);
        renderScreenings(
            document.getElementById('filterMovie').value,
            document.getElementById('filterDate').value
        );
        alert('Suất chiếu đã được xóa.');
    }
}

// Function to render movies in the management grid
function renderMovies() {
    const movieGrid = document.getElementById('movieManagementGrid');
    movieGrid.innerHTML = '';

    // Filter movies for current time (assuming "nowShowing" for demo)
    const currentMovies = movies.filter(movie => movie.status === 'nowShowing');

    currentMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <div class="movie-poster" style="background-image: url('${movie.poster}')">
                <div class="movie-status status-${movie.status}">${getStatusText(movie.status)}</div>
            </div>
            <div class="movie-details">
                <h4 class="movie-title">${movie.title}</h4>
                <div class="movie-meta">
                    <p><i class="fas fa-clock"></i> ${movie.duration} phút</p>
                    <p><i class="fas fa-star"></i> ${movie.rating}/10</p>
                    <p><i class="fas fa-user-tie"></i> ${movie.director}</p>
                    <p><i class="fas fa-users"></i> ${movie.actors}</p>
                    <p><i class="fas fa-tags"></i> ${movie.genre}</p>
                    <p><i class="fas fa-calendar-alt"></i> ${movie.releaseDate}</p>
                </div>
                <button class="btn btn-primary edit-movie" data-id="${movie.id}">Chỉnh sửa</button>
                <button class="btn btn-danger delete-movie" data-id="${movie.id}">Xóa</button>
            </div>
        `;
        movieGrid.appendChild(movieCard);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-movie').forEach(button => {
        button.addEventListener('click', function() {
            const movieId = this.dataset.id;
            editMovie(movieId);
        });
    });

    document.querySelectorAll('.delete-movie').forEach(button => {
        button.addEventListener('click', function() {
            const movieId = this.dataset.id;
            deleteMovie(movieId);
        });
    });
}

// Function to get status text
function getStatusText(status) {
    switch (status) {
        case 'nowShowing': return 'Đang chiếu';
        case 'comingSoon': return 'Sắp chiếu';
        case 'ended': return 'Đã kết thúc';
        default: return '';
    }
}

// Function to edit a movie
function editMovie(movieId) {
    const movie = movies.find(m => m.id == movieId);
    if (movie) {
        document.getElementById('movieModalTitle').textContent = 'Chỉnh sửa phim';
        document.getElementById('movieId').value = movie.id;
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieDuration').value = movie.duration;
        document.getElementById('movieDirector').value = movie.director;
        document.getElementById('movieActors').value = movie.actors;
        document.getElementById('movieGenre').value = movie.genre;
        document.getElementById('movieReleaseDate').value = movie.releaseDate;
        document.getElementById('movieStatus').value = movie.status;
        document.getElementById('movieDescription').value = movie.description;
        document.getElementById('addMovieModal').style.display = 'flex';
    }
}

// Function to delete a movie
function deleteMovie(movieId) {
    if (confirm('Bạn có chắc chắn muốn xóa phim này?')) {
        movies = movies.filter(m => m.id != movieId);
        renderMovies();
        alert('Phim đã được xóa.');
    }
}

// Toggle between sections
document.getElementById('homeLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('movieManagementSection').style.display = 'none';
    document.getElementById('screeningsSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'none';
    document.getElementById('customerSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelector('.nav-list a.active').classList.remove('active');
    this.classList.add('active');
});

document.getElementById('movieManagementLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('movieManagementSection').style.display = 'block';
    document.getElementById('screeningsSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'none';
    document.getElementById('customerSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelector('.nav-list a.active').classList.remove('active');
    this.classList.add('active');
    renderMovies();
});

document.getElementById('screeningsLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('movieManagementSection').style.display = 'none';
    document.getElementById('screeningsSection').style.display = 'block';
    document.getElementById('bookingSection').style.display = 'none';
    document.getElementById('customerSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelector('.nav-list a.active').classList.remove('active');
    this.classList.add('active');
    renderScreenings();
});

document.getElementById('bookingLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('movieManagementSection').style.display = 'none';
    document.getElementById('screeningsSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'block';
    document.getElementById('customerSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelector('.nav-list a.active').classList.remove('active');
    this.classList.add('active');
    renderBookings();
});

document.getElementById('customerLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('movieManagementSection').style.display = 'none';
    document.getElementById('screeningsSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'none';
    document.getElementById('customerSection').style.display = 'block';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelector('.nav-list a.active').classList.remove('active');
    this.classList.add('active');
    renderCustomers();
});

document.getElementById('reportLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('movieManagementSection').style.display = 'none';
    document.getElementById('screeningsSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'none';
    document.getElementById('customerSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'block';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelector('.nav-list a.active').classList.remove('active');
    this.classList.add('active');
    renderRevenueByGenre();
    renderSalesByMonth();
});

document.getElementById('settingsLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('movieManagementSection').style.display = 'none';
    document.getElementById('screeningsSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'none';
    document.getElementById('customerSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'block';
    document.querySelector('.nav-list a.active').classList.remove('active');
    this.classList.add('active');
    renderSettings();
});

// Show modals
document.getElementById('addMovieBtn').addEventListener('click', function() {
    document.getElementById('movieModalTitle').textContent = 'Thêm phim mới';
    document.getElementById('addMovieForm').reset();
    document.getElementById('movieId').value = '';
    document.getElementById('addMovieModal').style.display = 'flex';
});

document.getElementById('addMovieBtnManagement').addEventListener('click', function() {
    document.getElementById('movieModalTitle').textContent = 'Thêm phim mới';
    document.getElementById('addMovieForm').reset();
    document.getElementById('movieId').value = '';
    document.getElementById('addMovieModal').style.display = 'flex';
});

document.getElementById('addScreeningBtn').addEventListener('click', function() {
    document.getElementById('screeningModalTitle').textContent = 'Thêm suất chiếu mới';
    document.getElementById('addScreeningForm').reset();
    document.getElementById('screeningId').value = '';
    document.getElementById('addScreeningModal').style.display = 'flex';
});

document.getElementById('addScreeningBtnManagement').addEventListener('click', function() {
    document.getElementById('screeningModalTitle').textContent = 'Thêm suất chiếu mới';
    document.getElementById('addScreeningForm').reset();
    document.getElementById('screeningId').value = '';
    document.getElementById('addScreeningModal').style.display = 'flex';
});

document.getElementById('addBookingBtn').addEventListener('click', function() {
    document.getElementById('bookingModalTitle').textContent = 'Đặt vé nhanh';
    document.getElementById('quickBookingForm').reset();
    document.getElementById('bookingId').value = '';
    document.getElementById('bookingScreening').disabled = true;
    document.getElementById('selectedSeats').value = '';
    document.getElementById('totalPrice').value = '';
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
        seat.style.backgroundColor = '';
        seat.style.color = '';
    });
    document.getElementById('quickBookingModal').style.display = 'flex';
});

document.getElementById('addCustomerBtn').addEventListener('click', function() {
    document.getElementById('customerModalTitle').textContent = 'Thêm khách hàng mới';
    document.getElementById('addCustomerForm').reset();
    document.getElementById('customerId').value = '';
    document.getElementById('addCustomerModal').style.display = 'flex';
});

// Quick Actions buttons
document.querySelectorAll('.quick-actions .btn').forEach(function(btn, index) {
    btn.addEventListener('click', function() {
        if (index === 0) {
            document.getElementById('bookingModalTitle').textContent = 'Đặt vé nhanh';
            document.getElementById('quickBookingForm').reset();
            document.getElementById('bookingId').value = '';
            document.getElementById('bookingScreening').disabled = true;
            document.getElementById('selectedSeats').value = '';
            document.getElementById('totalPrice').value = '';
            document.querySelectorAll('.seat.selected').forEach(seat => {
                seat.classList.remove('selected');
                seat.style.backgroundColor = '';
                seat.style.color = '';
            });
            document.getElementById('quickBookingModal').style.display = 'flex';
        } else if (index === 1) {
            document.getElementById('dashboardSection').style.display = 'none';
            document.getElementById('movieManagementSection').style.display = 'block';
            document.getElementById('screeningsSection').style.display = 'none';
            document.getElementById('bookingSection').style.display = 'none';
            document.getElementById('customerSection').style.display = 'none';
            document.getElementById('reportSection').style.display = 'none';
            document.getElementById('settingsSection').style.display = 'none';
            document.querySelector('.nav-list a.active').classList.remove('active');
            document.getElementById('movieManagementLink').classList.add('active');
            renderMovies();
        } else if (index === 2) {
            document.getElementById('dashboardSection').style.display = 'none';
            document.getElementById('movieManagementSection').style.display = 'none';
            document.getElementById('screeningsSection').style.display = 'none';
            document.getElementById('bookingSection').style.display = 'none';
            document.getElementById('customerSection').style.display = 'none';
            document.getElementById('reportSection').style.display = 'block';
            document.getElementById('settingsSection').style.display = 'none';
            document.querySelector('.nav-list a.active').classList.remove('active');
            document.getElementById('reportLink').classList.add('active');
            renderRevenueByGenre();
            renderSalesByMonth();
        }
    });
});

// Close modals
document.getElementById('closeMovieModal').addEventListener('click', function() {
    document.getElementById('addMovieModal').style.display = 'none';
});

document.getElementById('closeScreeningModal').addEventListener('click', function() {
    document.getElementById('addScreeningModal').style.display = 'none';
});

document.getElementById('closeBookingModal').addEventListener('click', function() {
    document.getElementById('quickBookingModal').style.display = 'none';
});

document.getElementById('closeCustomerModal').addEventListener('click', function() {
    document.getElementById('addCustomerModal').style.display = 'none';
});

document.getElementById('cancelMovieBtn').addEventListener('click', function() {
    document.getElementById('addMovieModal').style.display = 'none';
});

document.getElementById('cancelScreeningBtn').addEventListener('click', function() {
    document.getElementById('addScreeningModal').style.display = 'none';
});

document.getElementById('cancelBookingBtn').addEventListener('click', function() {
    document.getElementById('quickBookingModal').style.display = 'none';
});

document.getElementById('cancelCustomerBtn').addEventListener('click', function() {
    document.getElementById('addCustomerModal').style.display = 'none';
});

// Handle movie form submission
document.getElementById('addMovieForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const movieId = document.getElementById('movieId').value;
    const newMovie = {
        id: movieId ? parseInt(movieId) : movies.length + 1,
        title: document.getElementById('movieTitle').value,
        duration: parseInt(document.getElementById('movieDuration').value),
        director: document.getElementById('movieDirector').value,
        actors: document.getElementById('movieActors').value,
        genre: document.getElementById('movieGenre').value,
        releaseDate: document.getElementById('movieReleaseDate').value,
        status: document.getElementById('movieStatus').value,
        rating: Math.random() * 2 + 8, // Random rating for demo
        description: document.getElementById('movieDescription').value,
        poster: document.getElementById('moviePoster').files[0] ? URL.createObjectURL(document.getElementById('moviePoster').files[0]) : '/api/placeholder/250/350'
    };

    if (movieId) {
        // Update existing movie
        const index = movies.findIndex(m => m.id == movieId);
        movies[index] = newMovie;
        alert('Phim đã được cập nhật.');
    } else {
        // Add new movie
        movies.push(newMovie);
        alert('Phim đã được thêm.');
    }

    renderMovies();
    document.getElementById('addMovieModal').style.display = 'none';
    this.reset();
});

// Handle screening form submission
document.getElementById('addScreeningForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const screeningId = document.getElementById('screeningId').value;
    const newScreening = {
        id: screeningId ? parseInt(screeningId) : screenings.length + 1,
        movieId: parseInt(document.getElementById('screeningMovie').value),
        room: `Phòng ${document.getElementById('screeningRoom').value}`,
        date: document.getElementById('screeningDate').value,
        startTime: document.getElementById('screeningStartTime').value,
        endTime: document.getElementById('screeningEndTime').value,
        status: document.getElementById('screeningStatus').value,
        price: parseInt(document.getElementById('screeningPrice').value)
    };

    if (screeningId) {
        // Update existing screening
        const index = screenings.findIndex(s => s.id == screeningId);
        screenings[index] = newScreening;
        alert('Suất chiếu đã được cập nhật.');
    } else {
        // Add new screening
        screenings.push(newScreening);
        alert('Suất chiếu đã được thêm.');
    }

    renderScreenings(
        document.getElementById('filterMovie').value,
        document.getElementById('filterDate').value
    );
    document.getElementById('addScreeningModal').style.display = 'none';
    this.reset();
});

// Handle booking form submission
document.getElementById('quickBookingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const bookingId = document.getElementById('bookingId').value;
    const screeningId = parseInt(document.getElementById('bookingScreening').value);
    const screening = screenings.find(s => s.id == screeningId);
    const adultTickets = parseInt(document.getElementById('adultTickets').value) || 0;
    const childTickets = parseInt(document.getElementById('childTickets').value) || 0;
    const seats = document.getElementById('selectedSeats').value.split(', ').filter(seat => seat);
    const totalPrice = adultTickets * screening.price + childTickets * (screening.price * 0.833); // Child ticket is ~83.3% of adult price

    const newBooking = {
        id: bookingId ? parseInt(bookingId) : bookings.length + 1,
        screeningId: screeningId,
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        adultTickets: adultTickets,
        childTickets: childTickets,
        seats: seats,
        totalPrice: Math.round(totalPrice)
    };

    if (bookingId) {
        // Update existing booking
        const index = bookings.findIndex(b => b.id == bookingId);
        bookings[index] = newBooking;
        alert('Vé đã được cập nhật.');
    } else {
        // Add new booking
        bookings.push(newBooking);
        alert('Đặt vé thành công!');
    }

    renderBookings(
        document.getElementById('filterBookingMovie').value,
        document.getElementById('filterBookingDate').value
    );
    document.getElementById('quickBookingModal').style.display = 'none';
    this.reset();
});

// Handle customer form submission
document.getElementById('addCustomerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const customerId = document.getElementById('customerId').value;
    const newCustomer = {
        id: customerId ? parseInt(customerId) : customers.length + 1,
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        status: document.getElementById('customerStatus').value,
        ticketsPurchased: parseInt(document.getElementById('customerTickets').value) || 0,
        totalSpending: parseInt(document.getElementById('customerSpending').value) || 0
    };

    if (customerId) {
        // Update existing customer
        const index = customers.findIndex(c => c.id == customerId);
        customers[index] = newCustomer;
        alert('Khách hàng đã được cập nhật.');
    } else {
        // Add new customer
        customers.push(newCustomer);
        alert('Khách hàng đã được thêm.');
    }

    renderCustomers(
        document.getElementById('filterCustomerName').value,
        document.getElementById('filterCustomerStatus').value
    );
    document.getElementById('addCustomerModal').style.display = 'none';
    this.reset();
});

// Handle admin account form submission
document.getElementById('adminAccountForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validate inputs
    if (!username) {
        alert('Vui lòng nhập tên người dùng.');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Vui lòng nhập email hợp lệ.');
        return;
    }

    if (currentPassword || newPassword || confirmNewPassword) {
        // Password change requested
        if (currentPassword !== adminAccount.password) {
            alert('Mật khẩu hiện tại không đúng.');
            return;
        }

        if (newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }
    }

    // Update admin account
    adminAccount.username = username;
    adminAccount.email = email;
    if (newPassword) {
        adminAccount.password = newPassword;
    }

    alert('Cập nhật tài khoản quản lý thành công!');
    this.reset();
    renderSettings();
});

// Handle system settings form submission
document.getElementById('systemSettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const cinemaName = document.getElementById('cinemaName').value.trim();
    const address = document.getElementById('cinemaAddress').value.trim();
    const phone = document.getElementById('cinemaPhone').value.trim();
    const email = document.getElementById('cinemaEmail').value.trim();

    // Validate inputs
    if (!cinemaName || !address || !phone || !email) {
        alert('Vui lòng điền đầy đủ các trường bắt buộc.');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Vui lòng nhập email liên hệ hợp lệ.');
        return;
    }

    // Update system settings
    systemSettings.cinemaName = cinemaName;
    systemSettings.address = address;
    systemSettings.phone = phone;
    systemSettings.email = email;

    alert('Cập nhật cài đặt hệ thống thành công!');
    this.reset();
    renderSettings();
});

// Cancel buttons for settings forms
document.getElementById('cancelAdminAccountBtn').addEventListener('click', function() {
    document.getElementById('adminAccountForm').reset();
    renderSettings();
});

document.getElementById('cancelSystemSettingsBtn').addEventListener('click', function() {
    document.getElementById('systemSettingsForm').reset();
    renderSettings();
});

// Filter screenings
document.getElementById('filterMovie').addEventListener('change', function() {
    renderScreenings(this.value, document.getElementById('filterDate').value);
});

document.getElementById('filterDate').addEventListener('change', function() {
    renderScreenings(document.getElementById('filterMovie').value, this.value);
});

// Filter bookings
document.getElementById('filterBookingMovie').addEventListener('change', function() {
    renderBookings(this.value, document.getElementById('filterBookingDate').value);
});

document.getElementById('filterBookingDate').addEventListener('change', function() {
    renderBookings(document.getElementById('filterBookingMovie').value, this.value);
});

// Filter customers
document.getElementById('filterCustomerName').addEventListener('input', function() {
    renderCustomers(this.value, document.getElementById('filterCustomerStatus').value);
});

document.getElementById('filterCustomerStatus').addEventListener('change', function() {
    renderCustomers(document.getElementById('filterCustomerName').value, this.value);
});

// Filter reports
document.getElementById('filterRevenuePeriod').addEventListener('change', function() {
    renderRevenueByGenre(this.value, document.getElementById('filterRevenueGenre').value);
});

document.getElementById('filterRevenueGenre').addEventListener('change', function() {
    renderRevenueByGenre(document.getElementById('filterRevenuePeriod').value, this.value);
});

// Seat selection functionality
document.querySelectorAll('.seat:not(.booked)').forEach(function(seat) {
    seat.addEventListener('click', function() {
        this.classList.toggle('selected');
        if (this.classList.contains('selected')) {
            this.style.backgroundColor = '#2ecc71';
            this.style.color = 'white';
        } else {
            this.style.backgroundColor = '';
            this.style.color = '';
        }

        // Update selected seats display
        let selectedSeats = [];
        document.querySelectorAll('.seat.selected').forEach(function(selectedSeat) {
            selectedSeats.push(selectedSeat.dataset.seat);
        });
        document.getElementById('selectedSeats').value = selectedSeats.join(', ');

        // Update total price
        updateTotalPrice();
    });
});

// Handle ticket quantity changes
document.getElementById('adultTickets').addEventListener('change', updateTotalPrice);
document.getElementById('childTickets').addEventListener('change', updateTotalPrice);

function updateTotalPrice() {
    const adultTickets = parseInt(document.getElementById('adultTickets').value) || 0;
    const childTickets = parseInt(document.getElementById('childTickets').value) || 0;
    const screeningId = document.getElementById('bookingScreening').value;
    const screening = screenings.find(s => s.id == screeningId);
    const selectedSeats = document.getElementById('selectedSeats').value.split(', ').filter(seat => seat);

    if (screening && selectedSeats.length === adultTickets + childTickets) {
        const totalPrice = adultTickets * screening.price + childTickets * (screening.price * 0.833);
        document.getElementById('totalPrice').value = Math.round(totalPrice).toLocaleString() + '₫';
    } else {
        document.getElementById('totalPrice').value = 'Số ghế và số vé không khớp';
    }
}

// Dynamic movie screening options
document.getElementById('bookingMovie').addEventListener('change', function() {
    const movieId = this.value;
    const screeningSelect = document.getElementById('bookingScreening');

    // Clear existing options
    screeningSelect.innerHTML = '<option value="">-- Chọn suất chiếu --</option>';
    screeningSelect.disabled = !movieId;

    if (movieId) {
        // Add options based on selected movie
        const movieScreenings = screenings.filter(s => s.movieId == movieId && s.date.startsWith('2025'));
        movieScreenings.forEach(s => {
            const optionText = `${s.room} - ${s.date} ${s.startTime} - ${s.endTime} (${s.price.toLocaleString()}₫)${s.status === 'full' ? ' - ĐÃ ĐẦY' : ''}`;
            addScreeningOption(screeningSelect, s.id, optionText, s.status === 'full');
        });
    }
});

function addScreeningOption(selectElement, value, text, disabled = false) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    if (disabled) {
        option.disabled = true;
    }
    selectElement.appendChild(option);
}

// Initial render
renderMovies();
renderScreenings();
renderBookings();
renderCustomers();
renderRevenueByGenre();
renderSalesByMonth();
renderSettings();