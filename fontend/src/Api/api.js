import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.101:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const simulateMomoPayment = async (bookingId, { selectedProducts, voucherId }) => {
  try {
    const response = await api.post(`/payments/simulate-momo/${bookingId}`, {
      selectedProducts,
      voucherId,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi giả lập thanh toán Momo:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const checkPaymentStatus = async (bookingId) => {
  try {
    const response = await api.get(`/payments/details/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái thanh toán:", {
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
    return response.data; // Chuẩn hóa trả về response.data
  } catch (error) {
    console.error("Error fetching seat map:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const holdSeats = async (showId, seatIds) => {
  try {
    console.log("Holding seats:", { showId, seatIds });
    const response = await api.post("/hold-seats", { showId, seatIds });
    console.log("Hold seats response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error holding seats:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
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
    throw error;
  }
};

export const getBookings = async () => {
  try {
    console.log("Calling API: /bookings");
    const response = await api.get("/bookings");
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return { bookings: [], message: "Bạn không có vé" };
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking by ID:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const checkExpiredBookings = async () => {
  try {
    const response = await api.get("/bookings/check-expiring");
    return response.data;
  } catch (error) {
    console.error("Error checking expired bookings:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return { message: "Không có vé sắp hết hạn", expiringTickets: 0 };
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