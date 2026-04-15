import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  toggleWishlist: (productId) => api.put(`/auth/wishlist/${productId}`)
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getTrending: () => api.get('/products/trending'),
  getFlashSales: () => api.get('/products/flash-sales'),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  getRecommendations: (params) => api.get('/products/recommendations', { params })
};

export const orderApi = {
  // normal orders
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  pay: (id, data) => api.put(`/orders/${id}/pay`, data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),

  // Razorpay
  createRazorpayOrder: (data) =>
    api.post('/orders/razorpay', data),

  verifyPayment: (data) =>
    api.post('/orders/verify', data),
};


export default api;
