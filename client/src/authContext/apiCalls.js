import axios from "axios";
import { loginFailure, loginStart, loginSuccess } from "./AuthActions";

// Базовий URL для API
const API_BASE_URL = "http://localhost:5000/api";

// Створюємо axios instance з базовою конфігурацією
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor для обробки помилок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('Сервер недоступний. Перевірте підключення.');
    }
    
    if (error.response?.status === 401) {
      // Очищуємо localStorage при 401 помилці
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw error;
  }
);

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await apiClient.post("/auth/login", user);
    
    // Перевіряємо чи отримали валідну відповідь з необхідними даними
    if (res.data && res.data.success !== false && res.data.accessToken) {
      dispatch(loginSuccess(res.data));
      return res.data;
    } else {
      dispatch(loginFailure());
      throw new Error(res.data?.message || "Помилка входу: відсутній токен доступу");
    }
  } catch (err) {
    dispatch(loginFailure());
    throw err;
  }
};

export const register = async (userData) => {
  try {
    const res = await apiClient.post("/auth/register", userData);
    return res.data;
  } catch (err) {
    throw err;
  }
};