import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
  updateDetails: (userData) => api.put("/auth/updatedetails", userData),
  updatePassword: (passwordData) =>
    api.put("/auth/updatepassword", passwordData),
};

// User API
export const userAPI = {
  getUsers: () => api.get("/users"),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Category API
export const categoryAPI = {
  getCategories: () => api.get("/categories"),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post("/categories", categoryData),
  updateCategory: (id, categoryData) =>
    api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Food Item API
export const foodItemAPI = {
  getFoodItems: (params) => api.get("/food-items", { params }),
  getFoodItem: (id) => api.get(`/food-items/${id}`),
  createFoodItem: (foodData) => api.post("/food-items", foodData),
  updateFoodItem: (id, foodData) => api.put(`/food-items/${id}`, foodData),
  deleteFoodItem: (id) => api.delete(`/food-items/${id}`),
  uploadImage: (formData) =>
    api.post("/food-items/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Order API
export const orderAPI = {
  getOrders: (params) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post("/orders", orderData),
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getOrderStatus: (id) => api.get(`/orders/${id}/status`),
};

// Reservation API
export const reservationAPI = {
  getReservations: (params) =>
    api.get("/reservations/my-reservations", { params }),
  getReservation: (id) => api.get(`/reservations/${id}`),
  createReservation: (reservationData) =>
    api.post("/reservations", reservationData),
  updateReservation: (id, reservationData) =>
    api.put(`/reservations/${id}`, reservationData),
  cancelReservation: (id) => api.put(`/reservations/${id}/cancel`),
};

// Payment API
export const paymentAPI = {
  createOrder: (paymentData) => api.post("/payments/create-order", paymentData),
  createReservationPayment: (paymentData) =>
    api.post("/payments/create-reservation-payment", paymentData),
  verifyPayment: (paymentData) => api.post("/payments/verify", paymentData),
  markReservationPaymentFailed: (paymentData) =>
    api.post("/payments/reservation-deposit-failed", paymentData),
  getPaymentHistory: (params) => api.get("/payments/history", { params }),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get("/settings"),
  updateSettings: (settings) => api.put("/settings", settings),
};

export default api;
