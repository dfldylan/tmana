import axios from 'axios';
import { TaxForm } from '../types/taxTypes';

const BASE_URL = 'http://39.105.111.185:8000/api';

// 获取CSRF令牌函数
function getCsrfToken() {
  return document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1] || '';
}

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCsrfToken(), // 设置CSRF令牌
  },
  withCredentials: true, // 关键：允许跨域请求携带凭证（Cookie）
});

// 请求拦截器 - 添加认证token和更新CSRF令牌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-CSRFToken'] = getCsrfToken(); // 更新CSRF令牌
  return config;
});

// 顶层导出函数，用于组件直接导入
export const fetchForms = () => api.get<TaxForm[]>('/tax-forms/');
export const fetchUsers = () => admin.getAllUsers();
export const fetchUserForms = () => api.get<TaxForm[]>('/tax-forms/user/');

// 用户认证相关API
export const auth = {
  login: (username: string, password: string) =>
    api.post('/accounts/login/', { username, password }),
  
  register: (userData: {
    username: string;
    password: string;
    email: string;
    role: 'admin' | 'user';
  }) => api.post('/accounts/register/', userData),
  
  logout: () => api.post('/accounts/logout/'),
  
  getCurrentUser: () => api.get('/accounts/me/'),
};

// 税务表单相关API
export const taxForms = {
  // 获取所有表单
  getAllForms: () => api.get<TaxForm[]>('/tax-forms/'), // This will now use the updated TaxForm
  
  // 为了兼容性添加fetchForms别名
  fetchForms: () => api.get<TaxForm[]>('/tax-forms/'), // This will also use the updated TaxForm
  
  // 获取单个表单详情
  getForm: (id: number) => api.get<TaxForm>(`/tax-forms/${id}/`), // Ensure TaxForm is suitable here too
  
  // 创建新表单
  createForm: (formData: {
    title: string;
    description: string;
    due_date: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
  }) => api.post('/tax-forms/', formData),
  
  // 更新表单
  updateForm: (id: number, formData: {
    title?: string;
    description?: string;
    due_date?: string;
    status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  }) => api.patch(`/tax-forms/${id}/`, formData),
  
  // 删除表单
  deleteForm: (id: number) => api.delete(`/tax-forms/${id}/`),
  
  // 提交表单
  submitForm: (id: number) => api.post(`/tax-forms/${id}/submit/`),
};

// 管理员特定API
export const admin = {
  // 获取所有用户
  getAllUsers: () => api.get('/accounts/users/'),
  
  // 获取单个用户详情
  getUser: (id: number) => api.get(`/accounts/users/${id}/`),
  
  // 更新用户信息
  updateUser: (id: number, userData: {
    email?: string;
    role?: 'admin' | 'user';
    is_active?: boolean;
  }) => api.patch(`/accounts/users/${id}/`, userData),
  
  // 删除用户
  deleteUser: (id: number) => api.delete(`/accounts/users/${id}/`),
};

// 错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  // 获取用户列表
  getUsers: () => api.get('/accounts/users/'),
  
  // 创建用户
  createUser: (userData: {
    username: string;
    email: string;
    password: string;
    user_type: 'admin' | 'user';
  }) => api.post('/accounts/users/', userData),
  
  // 更新用户
  updateUser: (id: number, userData: {
    email?: string;
    user_type?: 'admin' | 'user';
    is_active?: boolean;
  }) => api.patch(`/accounts/users/${id}/`, userData),
  
  // 删除用户
  deleteUser: (id: number) => api.delete(`/accounts/users/${id}/`),

  // 用户登录
  login: (credentials: { username: string; password: string }) => api.post('/accounts/login/', credentials),

  // 用户登出
  logout: () => api.post('/accounts/logout/'),

  // 检查用户认证状态
  checkAuth: () => api.get('/accounts/check-auth/'),

  register: async (userData: { username: string, email: string, password: any, password2: any }) => {
    try {
      const response = await api.post('/accounts/register/', userData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = '注册失败。';
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.join(' ');
        } else if (typeof errorData === 'object' && errorData !== null) {
          errorMessage = Object.entries(errorData)
            .map(([field, messages]) => {
              const msgStr = Array.isArray(messages) ? messages.join(', ') : String(messages);
              return `${field}: ${msgStr}`;
            })
            .join('; ');
        }
        throw new Error(errorMessage);
      }
      throw new Error(error.message || '注册过程中发生未知错误。');
    }
  },
};

export default api;