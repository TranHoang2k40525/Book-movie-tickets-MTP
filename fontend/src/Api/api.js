// fontend/src/Api/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const BASE_URL = "http://192.168.1.104:3000";

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
    console.log("Access Token:", token); // Log để kiểm tra token
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
    if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        const response = await axios.post(`${BASE_URL}/api/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        // Điều hướng về màn hình đăng nhập
        // Lưu ý: Cần import navigation hoặc sử dụng một cơ chế khác để điều hướng
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getMovies = () => api.get("/api/movies");
export const getMovieById = (id) => api.get(`/api/movies/${id}`);
export const getShowtimesByMovieId = (id) => api.get(`/api/movies/${id}/showtimes`);
export const getCinemasByMovieAndDate = (id, date) => api.get(`/api/movies/${id}/cinemas`, { params: { date } });
export const getShowtimesByCinemaAndDate = (movieId, cinemaId, date) =>
  api.get(`/api/movies/${movieId}/cinemas/${cinemaId}/showtimes`, { params: { date } });
export const getMoviesShowingToday = () => api.get(`/api/movies/movies/showing-today`);

export const login = async (email, password) => {
  try {
    const response = await api.post("/api/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post("/api/refresh-token", { refreshToken });
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const getAccount = async () => {
  try {
    const response = await api.post("/api/get-account");
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
    const response = await api.post("/api/get-customer");
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
export const register = (data) => api.post("/api/register", data);
export const sendOtp = (data) => api.post("/api/send-otp", data);
export const resetPassword = (data) => api.post("/api/reset-password", data);
export const updateAvatar = async (avatarUrl) => {
  try {
    console.log("Dữ liệu gửi đi:", { avatarUrl });
    const response = await api.post("/api/update-avatar", { avatarUrl });
    return response.data;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};
export const updateCustomer = (data) => api.put("/api/update-customer", data);
export const deleteAccount = () => api.delete("/api/delete-account");
export const getCities = () => api.get("/api/cities");
export const getCinemas = () => api.get("/api/cinemas");
export const getCinemasByCity = (cityId) => api.get(`/api/cinemas-by-city/${cityId}`);
export const getMoviesAndShowtimesByCinema = (cinemaId, date) =>
  api.get(`/api/movies/cinemas/${cinemaId}/movies-and-showtimes`, { params: { date } });
export const likeMovie = async (movieId) => {
  try {
    const response = await api.post("/api/like", { movieId });
    return response.data;
  } catch (error) {
    console.error("Error liking movie:", error);
    throw error;
  }
};

export const getLikeStatus = async (movieId) => {
  try {
    const response = await api.get(`/api/like/${movieId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching like status:", error);
    throw error;
  }
};
export const getSeatMapByShow = async (showId) => {
  return await api.get(`/api/movies/${showId}/seats`);
};
export const holdSeats = async (showId, seatIds) => {
  try {
    const response = await api.post(`/api/movies/${showId}/hold-seats`, { seatIds });
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
// Thêm hàm mới để lấy danh sách sản phẩm
export const getProducts = async () => {
  try {
    const response = await api.get("/api/products");
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
export default api;