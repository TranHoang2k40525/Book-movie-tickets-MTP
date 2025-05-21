import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.101:3000/api";
const WS_URL = "ws://192.168.1.101:3000"; // Địa chỉ WebSocket

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Quản lý kết nối WebSocket
let ws = null;
let wsCallbacks = { onSeatUpdate: null, onError: null, onClose: null };
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 giây

// Interceptor cho yêu cầu HTTP
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("Request URL:", `${BASE_URL}${config.url}`);
    console.log("Access Token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No access token found in AsyncStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho phản hồi HTTP
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const response = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Hàm thiết lập kết nối WebSocket
export const setupWebSocket = async (showId, { onSeatUpdate, onError, onClose }) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found for WebSocket connection");
    }

    // Đóng kết nối WebSocket hiện tại nếu tồn tại
    if (ws) {
      ws.close();
      ws = null;
    }

    // Tạo kết nối WebSocket mới
    ws = new WebSocket(`${WS_URL}?showId=${showId}&token=${encodeURIComponent(token)}`);

    // Lưu các callback
    wsCallbacks = { onSeatUpdate, onError, onClose };

    ws.onopen = () => {
      console.log(`WebSocket connected for showId: ${showId}`);
      reconnectAttempts = 0; // Reset số lần thử kết nối lại
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "SEAT_UPDATE" && wsCallbacks.onSeatUpdate) {
          console.log("Received seat update:", data.seatLayout);
          wsCallbacks.onSeatUpdate(data.seatLayout);
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
        if (wsCallbacks.onError) {
          wsCallbacks.onError(err);
        }
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected: ${event.reason || "No reason provided"}`);
      ws = null;
      if (wsCallbacks.onClose) {
        wsCallbacks.onClose(event);
      }
      // Thử kết nối lại nếu chưa vượt quá số lần tối đa
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttempts++;
          console.log(`Reconnecting WebSocket, attempt ${reconnectAttempts}...`);
          setupWebSocket(showId, wsCallbacks);
        }, RECONNECT_INTERVAL);
      } else {
        console.error("Max reconnect attempts reached");
        if (wsCallbacks.onError) {
          wsCallbacks.onError(new Error("Failed to reconnect WebSocket"));
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (wsCallbacks.onError) {
        wsCallbacks.onError(error);
      }
    };

    return ws;
  } catch (error) {
    console.error("Error setting up WebSocket:", error);
    if (wsCallbacks.onError) {
      wsCallbacks.onError(error);
    }
    throw error;
  }
};

// Hàm đóng kết nối WebSocket
export const closeWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
    wsCallbacks = { onSeatUpdate: null, onError: null, onClose: null };
    reconnectAttempts = 0;
    console.log("WebSocket connection closed");
  }
};

// Các hàm HTTP
export const simulateMomoPayment = async (bookingId, data) => {
  try {
    console.log("Sending simulateMomoPayment request:", { bookingId, data });
    const response = await api.post(`/payments/simulate-momo/${bookingId}`, data);
    console.log("simulateMomoPayment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi giả lập thanh toán Momo:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error.response?.data || error;
  }
};
// API vé
export const getBookings = async (page = 1, limit = 10) => {
  try {
    console.log(`Calling API: /tickets?page=${page}&limit=${limit}`);
    const response = await api.get('/tickets', { params: { page, limit } });
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error.response?.data || error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    console.log(`Calling API: /tickets/${bookingId}`);
    const response = await api.get(`/tickets/${bookingId}`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking by ID:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error.response?.data || error;
  }
};

export const checkExpiredBookings = async () => {
  try {
    console.log('Calling API: /tickets/expiring');
    const response = await api.get('/tickets/expiring');
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking expired bookings:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error.response?.data || error;
  }
};

// Api thanh toántoán
export const checkPaymentStatus = async (bookingId) => {
  try {
    const response = await api.get(`/payments/check-status/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái thanh toán:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error.response?.data || error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    console.log(`Cancelling booking: ${bookingId}`);
    const response = await api.post("/cancel-booking", { bookingId });
    console.log("Cancel booking response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error cancelling booking:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getVouchers = async () => {
  try {
    const response = await api.get("/vouchers");
    return response.data;
  } catch (error) {
    console.error("Error fetching vouchers:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const useVoucher = async (voucherId) => {
  try {
    const response = await api.post("/use-voucher", { voucherId });
    return response.data;
  } catch (error) {
    console.error("Error using voucher:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getMovies = () => api.get("/movies");
export const getMovieById = (id) => api.get(`/movies/${id}`);
export const getShowtimesByMovieId = (id) => api.get(`/movies/${id}/showtimes`);
export const getCinemasByMovieAndDate = (id, date) =>
  api.get(`/movies/${id}/cinemas`, { params: { date } });
export const getShowtimesByCinemaAndDate = (movieId, cinemaId, date) =>
  api.get(`/movies/${movieId}/cinemas/${cinemaId}/showtimes`, { params: { date } });
export const getMoviesShowingToday = () => api.get(`/movies/movies/showing-today`);

export const login = async (email, password) => {
  try {
    const response = await api.post("/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post("/refresh-token", { refreshToken });
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const getAccount = async () => {
  try {
    const response = await api.post("/get-account");
    console.log("Account API response:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching account:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getCustomer = async () => {
  try {
    const response = await api.post("/get-customer");
    console.log("Customer API response:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching customer:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const register = (data) => api.post("/register", data);
export const sendOtp = (data) => api.post("/send-otp", data);
export const resetPassword = (data) => api.post("/reset-password", data);
export const updateAvatar = async (avatarUrl) => {
  try {
    console.log("Dữ liệu gửi đi:", { avatarUrl });
    const response = await api.post("/update-avatar", { avatarUrl });
    return response.data;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};

export const updateCustomer = (data) => api.put("/update-customer", data);
export const deleteAccount = () => api.delete("/delete-account");
export const getCities = () => api.get("/cities");
export const getCinemas = () => api.get("/cinemas");
export const getCinemasByCity = (cityId) => api.get(`/cinemas-by-city/${cityId}`);
export const getMoviesAndShowtimesByCinema = (cinemaId, date) =>
  api.get(`/movies/cinemas/${cinemaId}/movies-and-showtimes`, { params: { date } });

export const likeMovie = async (movieId) => {
  try {
    const response = await api.post("/like", { movieId });
    return response.data;
  } catch (error) {
    console.error("Error liking movie:", error);
    throw error;
  }
};

export const getLikeStatus = async (movieId) => {
  try {
    const response = await api.get(`/like/${movieId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching like status:", error);
    throw error;
  }
};

export const getSeatMapByShow = async (showId) => {
  try {
    console.log(`Fetching seat map for showId: ${showId}`);
    const response = await api.get(`/movies/${showId}/seats`);
    console.log("Seat map response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching seat map:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const holdSeats = async (showId, seatIds, selectedProducts = []) => {
  try {
    console.log("Holding seats:", { showId, seatIds, selectedProducts });
    const response = await api.post("/hold-seats", { showId, seatIds, selectedProducts });
    console.log("Hold seats response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error holding seats:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error.response?.data || error;
  }
};

export const getProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getNotificationById = async (notificationId) => {
  try {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notification details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error.response?.data || error;
  }
};






export const processPayment = async (data) => {
  try {
    const response = await api.post("/payments/process", data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getApplicableVouchers = async (customerId, amount) => {
  try {
    const response = await api.get(
      `/payments/vouchers/${customerId}${amount ? `?amount=${amount}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getPaymentDetails = async (bookingId) => {
  try {
    const response = await api.get(`/payments/details/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thanh toán:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getBookingDetails = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const confirmPayment = async (bookingId, paymentData) => {
  try {
    const response = await api.post(`/payments/confirm/${bookingId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error confirming payment:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const generateQRCode = async (bookingId, data) => {
  try {
    const response = await api.post(`/payments/generate-qr/${bookingId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error generating QR code:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export default api;