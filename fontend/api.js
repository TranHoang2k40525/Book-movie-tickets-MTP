import axios from "axios";

const BASE_URL = "http://192.168.1.101:3000";

// Cấu hình axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Các hàm gọi API
export const getMovies = () => api.get("/api/movies");
export const getMovieById = (id) => api.get(`/api/movies/${id}`);


export const login = (data) => api.post("/api/login", data);
export const getAccount = (data) => api.post("/api/get-account", data);
export const getCustomer = (data) => api.post("/api/get-customer", data);
export const register = (data) => api.post("/api/register", data);
export const sendOtp = (data) => api.post("/api/send-otp", data);
export const resetPassword = (data) => api.post("/api/reset-password", data);
export const updateAvatar = (data) => api.post("/api/update-avatar", data);
export const updateCustomer = (data) => api.put("/api/update-customer", data);
export const deleteAccount = (data) => api.delete("/api/delete-account", { data });
export const getCities = () => api.get("/api/cities");
export const getCinemas = () => api.get("/api/cinemas");
export default api;