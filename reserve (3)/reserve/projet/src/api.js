import axios from 'axios';

const api = axios.create({
  // الرابط الجديد تاع السيرفر في Render
  baseURL: 'https://hygeia-backend-final.onrender.com/api/'
});


// Request interceptor for adding the token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
