import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Link } from 'react-router-dom'; // 导入 Link

const Login: React.FC = () => {
  // 使用优化后的 useAuth 钩子
  const { isAuthenticated, login, error: authError, clearError } = useAuth();
  
  // 本地状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // 获取重定向路径
  const from = (location.state as { from?: string })?.from || '/';

  // 如果已经认证，重定向到首页或指定页面
  useEffect(() => {
    console.log("认证状态:", isAuthenticated);
    console.log("重定向目标:", from);
    
    if (isAuthenticated) {
      console.log("准备重定向到:", from);
      navigate(from, { replace: true });
      console.log("重定向已执行");
    }
  }, [isAuthenticated, navigate, from]);

  // 监听认证错误
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]); // 移除 clearError 依赖

  // 添加一个单独的 useEffect 用于组件卸载时清理
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []); // 空依赖数组，只在组件卸载时执行

  // 表单验证
  const validateForm = () => {
    if (!username.trim()) {
      setFormError('请输入用户名');
      return false;
    }
    if (!password.trim()) {
      setFormError('请输入密码');
      return false;
    }
    return true;
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误
    setFormError('');
    
    // 表单验证
    if (!validateForm()) return;
    
    // 设置提交状态
    setIsSubmitting(true);
    
    try {
      await login(username, password);
      // 成功登录会通过 useEffect 重定向
    } catch (err: any) {
      setFormError(err.message || '登录失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理回车键提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">税务管理系统</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              onKeyDown={handleKeyDown}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>

          {formError && <div className="error-message">{formError}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登录中...' : '登录'}
          </button>
        </form>
        {/* 
          注意: 通常注册链接位于登录页面或公共导航区域。
          此处根据您的要求添加到用户仪表盘。
        */}
        <p style={{ marginBottom: '20px' }}>
            <Link to="/register">注册新用户</Link>
        </p>
        
      </div>
    </div>
  );
};

export default Login;