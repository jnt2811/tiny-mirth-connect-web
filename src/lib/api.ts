import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Mirth Connect wrap response trong Java class name, ví dụ:
// { "com.mirth.connect.model.LoginStatus": { ... } }
// Interceptor này unwrap tự động nếu response là object với đúng 1 key bắt đầu bằng "com.mirth"
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const keys = Object.keys(data);
      if (keys.length === 1 && keys[0].startsWith('com.mirth')) {
        response.data = data[keys[0]];
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
