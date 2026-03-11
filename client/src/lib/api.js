import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('token');
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth API ────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Properties API ──────────────────────────────────────────────
export const propertiesAPI = {
    getAll: (params) => api.get('/properties', { params }),
    getById: (id) => api.get(`/properties/${id}`),
    create: (data) => api.post('/properties', data),
    update: (id, data) => api.put(`/properties/${id}`, data),
    delete: (id) => api.delete(`/properties/${id}`),
    getMyListings: () => api.get('/properties/user/my-listings'),
    addImages: (id, images) => api.post(`/properties/${id}/images`, { images }),
    updateStatus: (id, status) => api.put(`/properties/${id}`, { status }),
};

// ─── Services API ────────────────────────────────────────────────
export const servicesAPI = {
    getCategories: () => api.get('/services/categories'),
    getProviders: (params) => api.get('/services/providers', { params }),
    getProviderById: (id) => api.get(`/services/providers/${id}`),
    getMyProfile: () => api.get('/services/profile/me'),
    createOrUpdateProfile: (data) => api.post('/services/profile', data),
    createProfile: (data) => api.post('/services/profile', data),
    updateProfile: (data) => api.put('/services/profile', data),
    toggleActive: () => api.put('/services/profile/toggle'),
};

// ─── Bookings API ────────────────────────────────────────────────
export const bookingsAPI = {
    create: (data) => api.post('/bookings', data),
    getAll: (params) => api.get('/bookings', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// ─── Reviews API ─────────────────────────────────────────────────
export const reviewsAPI = {
    getAll: (params) => api.get('/reviews', { params }),
    create: (data) => api.post('/reviews', data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// ─── Messages API ────────────────────────────────────────────────
export const messagesAPI = {
    startConversation: (data) => api.post('/messages/conversations', data),
    getConversations: () => api.get('/messages/conversations'),
    sendMessage: (conversationId, content) => api.post(`/messages/${conversationId}`, { content }),
    getMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
};

export default api;
