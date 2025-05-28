const API_BASE_URL = 'http://localhost:3000/api';
const WS_URL = 'ws://localhost:3000';

const api = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      if (data.customerId) localStorage.setItem('customerId', data.customerId);
      if (data.accountId) localStorage.setItem('accountId', data.accountId);
      if (data.accountType) localStorage.setItem('accountType', data.accountType);
    }
    return data;
  },
  async register(email, password) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerEmail: email, password, isAdmin: true })
    });
    return response.json();
  },
  async getCinemas() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/cinemas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async getMoviesByCinema(cinemaId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/movies/cinemas/${cinemaId}/movies-and-showtimes?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async getMovieById(movieId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async updateMovie(movieId, movieData) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(movieData)
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async getShowtimesByMovieId(movieId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/showtimes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async getSeatMapByShow(showId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/datghe/${showId}/seats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async holdSeats(showId, seatIds, selectedProducts = []) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token! Vui lòng đăng nhập lại.');
    // Đảm bảo seatIds là số nguyên
    const validatedSeatIds = seatIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (validatedSeatIds.length !== seatIds.length) {
      throw new Error('Danh sách seatIds chứa giá trị không hợp lệ');
    }
    // Kiểm tra trùng lặp seatIds
    const uniqueSeatIds = new Set(validatedSeatIds);
    if (uniqueSeatIds.size !== validatedSeatIds.length) {
      throw new Error('Danh sách seatIds chứa ghế trùng lặp');
    }
    console.log('holdSeats - Payload:', { showId, seatIds: validatedSeatIds, selectedProducts });
    const payload = {
      showId: parseInt(showId),
      seatIds: validatedSeatIds,
      selectedProducts
    };
    const response = await fetch(`${API_BASE_URL}/hold-seats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    console.log('holdSeats - Response status:', response.status);
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('customerId');
      localStorage.removeItem('accountId');
      localStorage.removeItem('accountType');
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Lỗi khi giữ ghế: ${response.statusText}`);
    }
    return response.json();
  },
  async cancelBooking(bookingId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/cancel-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingId: parseInt(bookingId) })
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Phiên đăng nhập hết hạn.');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi hủy đặt ghế');
    }
    return response.json();
  },
  async getProducts() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[${new Date().toISOString()}] Lỗi khi lấy sản phẩm:`, errorData);
      throw new Error(errorData.message || 'Lỗi khi lấy sản phẩm');
    }
    return response.json();
  },
  connectWebSocket(showId, onUpdate) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for WebSocket connection');
      return;
    }
    const ws = new WebSocket(`${WS_URL}?showId=${showId}&token=${token}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'SEAT_UPDATE') {
        onUpdate();
      }
    };
    ws.onopen = () => console.log('WebSocket kết nối thành công');
    ws.onclose = () => console.log('WebSocket đã ngắt kết nối');
    ws.onerror = (error) => console.error('Lỗi WebSocket:', error);
    return ws;
  },
  async getPaymentDetails(bookingId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/payment/details/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi lấy chi tiết thanh toán');
    }
    return response.json();
  },
  async generateQRCode(bookingId, paymentMethod, selectedProducts, voucherId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/payment/generate-qr/${bookingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ paymentMethod, selectedProducts, voucherId })
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi sinh mã QR');
    }
    return response.json();
  },
  async simulateMomoPayment(bookingId, selectedProducts, voucherId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/payment/simulate-momo/${bookingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ selectedProducts, voucherId, paymentConfirmed: true })
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi giả lập thanh toán Momo');
    }
    return response.json();
  },
  async processPayment(bookingId, selectedProducts, voucherId, paymentMethod, termsAccepted) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/payment/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingId, selectedProducts, voucherId, paymentMethod, termsAccepted })
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi xử lý thanh toán');
    }
    return response.json();
  },
  async getApplicableVouchers(customerId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/payment/vouchers/${customerId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi lấy danh sách voucher');
    }
    return response.json();
  },
  async getDashboardStats() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/statistics/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async getAllMovies() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/movies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async addMovie(movieData) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(movieData)
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async deleteMovie(movieId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async getRevenueStats(startDate, endDate) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/statistics/revenue?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  },
  async getTicketStats(startDate, endDate) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Không tìm thấy token!');
    const response = await fetch(`${API_BASE_URL}/statistics/tickets?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Token không hợp lệ hoặc đã hết hạn!');
    }
    return response.json();
  }
};

export default api;