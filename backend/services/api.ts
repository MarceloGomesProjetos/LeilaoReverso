import axios from 'axios'; // Se o erro persistir, verifique esta linha

const api = axios.create({
  baseURL: 'http://localhost:5432', // Certifique-se de que esta é a porta do seu backend
});

// Interceptor para enviar o Token JWT que salvamos no Login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ShortWin:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;