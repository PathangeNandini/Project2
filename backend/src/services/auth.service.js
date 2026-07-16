import api from '../api/axios';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const getCurrentUser = () => api.get('/auth/me');