import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Market API
export const marketAPI = {
  getWatchlist: () => api.get('/api/market/watchlist'),
  searchStocks: (query) => api.get(`/api/market/search?query=${query}`),
  getStockDetails: (symbol) => api.get(`/api/market/stock/${symbol}`),
  addToWatchlist: (stockData) => api.post('/api/market/watchlist/add', stockData),
  removeFromWatchlist: (symbol) => api.delete(`/api/market/watchlist/${symbol}`),
};

// Orders API (without auth for demo)
export const ordersAPI = {
  placeOrder: (orderData) => api.post('/api/orders/place', orderData),
  getOrders: () => api.get('/api/orders'),
  modifyOrder: (orderId, orderData) => api.put(`/api/orders/modify/${orderId}`, orderData),
  cancelOrder: (orderId) => api.delete(`/api/orders/cancel/${orderId}`),
};

// Portfolio API (without auth for demo)
export const portfolioAPI = {
  getHoldings: () => api.get('/api/portfolio/holdings'),
  getPositions: () => api.get('/api/portfolio/positions'),
  getSummary: () => api.get('/api/portfolio/summary'),
};

// User API (without auth for demo)
export const userAPI = {
  addFunds: (amount) => api.post('/api/user/funds/add', { amount }),
  withdrawFunds: (amount) => api.post('/api/user/funds/withdraw', { amount }),
  getBalance: () => api.get('/api/user/balance'),
};

export default api;