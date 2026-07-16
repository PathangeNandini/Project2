import api from '../api/axios';

export const createOrder = (payload) => api.post('/orders', payload);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);