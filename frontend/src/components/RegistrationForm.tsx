import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api'; // 假设 userAPI 在 api.ts 中定义并导出

const RegistrationForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== password2) {
            setError('两次输入的密码不一致。');
            setLoading(false);
            return;
        }

        try {
            await userAPI.register({ username, email, password, password2 });
            alert('注册成功！请登录。');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || '注册失败，请稍后再试。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">注册新用户</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="username">用户名</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="请输入用户名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">邮箱</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="请输入邮箱"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="form-input"
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
                            required
                            disabled={loading}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password2">确认密码</label>
                        <input
                            id="password2"
                            type="password"
                            placeholder="请再次输入密码"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                            disabled={loading}
                            className="form-input"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={loading}
                    >
                        {loading ? '注册中...' : '注册'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;