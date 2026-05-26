import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

const API = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // Avoid indefinite hangs when backend is unreachable
  timeout: 7000,
});

const getStoredToken = () => localStorage.getItem('accessToken') || localStorage.getItem('token');

const setStoredSession = (session = {}) => {
  if (session.accessToken) {
    localStorage.setItem('accessToken', session.accessToken);
    localStorage.setItem('token', session.accessToken);
  }

  if (session.user) {
    localStorage.setItem('user', JSON.stringify(session.user));
  }
};

const clearStoredSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Request Interceptor: Attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth failure redirects
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'ACCESS_TOKEN_EXPIRED' &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await API.post('/auth/refresh-token');
        const nextAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.data?.token;

        if (nextAccessToken) {
          setStoredSession({ accessToken: nextAccessToken });
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        clearStoredSession();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // If unauthorized (invalid token), log out user
    if (error.response && error.response.status === 401) {
      clearStoredSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const extractPayload = (response) => response?.data?.data ?? response?.data ?? {};

export const authApi = {
  login: (credentials) => API.post('/auth/login', credentials),
  logout: () => API.post('/auth/logout'),
  refreshToken: () => API.post('/auth/refresh-token'),
  profile: () => API.get('/auth/profile'),
  updateProfile: (payload) => API.put('/auth/profile', payload),
};

export const dashboardApi = {
  stats: () => API.get('/dashboard/stats'),
};

export const postsApi = {
  list: (params) => API.get('/posts/admin', { params }),
  get: (id) => API.get(`/posts/admin/${id}`),
  create: (payload) => API.post('/posts/admin', payload),
  update: (id, payload) => API.put(`/posts/admin/${id}`, payload),
  remove: (id) => API.delete(`/posts/admin/${id}`),
  preview: (id) => API.get(`/posts/admin/preview/${id}`),
  publish: (id) => API.patch(`/posts/admin/${id}/publish`),
  draft: (id) => API.patch(`/posts/admin/${id}/draft`),
  categories: () => API.get('/posts/categories'),
  tags: () => API.get('/posts/tags'),
  search: (params) => API.get('/posts/search', { params }),
};

export const usersApi = {
  list: (params) => API.get('/users', { params }),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  toggleStatus: (id) => API.put(`/users/${id}/status`),
};

export const mediaApi = {
  uploadImage: (formData) => API.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadFeatureImage: (formData) => API.post('/upload/feature-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadGallery: (formData) => API.post('/upload/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: () => API.get('/upload/media'),
  remove: (url) => API.delete('/upload/media', { data: { url } }),
};

export const taxonomyApi = {
  categories: () => API.get('/posts/categories'),
  tags: () => API.get('/posts/tags'),
};

export { apiBaseUrl, getStoredToken, setStoredSession, clearStoredSession, extractPayload };

export default API;
