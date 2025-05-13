import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import { userAPI } from './services/api';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import './App.css';
import Main from './pages/Main';

// 定义认证状态类型
interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userType?: 'admin' | 'user' | null;
  isLoading: boolean;
  error: string | null;
}

// 定义认证上下文接口
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// 创建认证上下文
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  userType: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// 自定义钩子 - 便于组件使用认证上下文
export const useAuth = () => useContext(AuthContext);

// 认证提供者组件
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // 状态管理
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    userType: null,
    isLoading: true,
    error: null
  });

  // 检查认证状态
  useEffect(() => {
    // 使用 window.location.pathname.startsWith('/login') 而不是 ===
    if (window.location.pathname.startsWith('/login')) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    const checkAuthStatus = async () => {
      try {
        const response = await userAPI.checkAuth();
        setAuthState({
          isAuthenticated: response.data.isAuthenticated,
          username: response.data.username,
          userType: response.data.user_type,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          username: null,
          userType: null,
          isLoading: false,
          error: "认证会话已过期"
        });
      }
    };

    checkAuthStatus();
  }, []);

  // 登录方法
  const login = async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await userAPI.login({ username, password });
      console.log("登录 API 响应:", response.data);
      
      // 确认响应中确实有 isAuthenticated = true
      setAuthState({
        isAuthenticated: true,  // 强制设置为 true
        username: response.data.username,
        userType: response.data.user_type,
        isLoading: false,
        error: null
      });
      console.log("登录后认证状态已设置为:", true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '登录失败，请检查用户名和密码';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  };

  // 登出方法
  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await userAPI.logout();
    } catch (error) {
      console.error('登出时出错:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        username: null,
        userType: null,
        isLoading: false,
        error: null
      });
    }
  };

  // 清除错误
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // 加载状态处理
  if (authState.isLoading && !window.location.pathname.startsWith('/login')) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>正在加载，请稍候...</p>
      </div>
    );
  }

  // 提供上下文
  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 使用上下文的认证布局
const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <Outlet />;
};

// App主组件
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 登录路由不需要认证检查 */}
          <Route path="/login" element={<Login />} />
          
          {/* 受保护的路由 */}
          <Route element={<AuthLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/" element={<Main />} />
            <Route path="/example" element={<UserManagement />} />
          </Route>
          
          {/* 捕获所有其他路径，重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;