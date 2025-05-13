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
            // 注册成功后，可以导航到登录页面或显示成功消息
            alert('注册成功！请登录。');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || '注册失败，请稍后再试。');
        } finally {
            setLoading(false);
        }
    };

    // 基础样式，您可以根据需要进行扩展
    const styles = {
        container: { maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px' },
        input: { width: '100%', padding: '8px', boxSizing: 'border-box' as 'border-box' },
        button: { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
        error: { color: 'red', marginBottom: '10px' }
    };

    return (
        <div style={styles.container}>
            <h2>注册新用户</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={styles.error}>{error}</p>}
                <div style={styles.formGroup}>
                    <label htmlFor="username" style={styles.label}>用户名:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>邮箱:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="password" style={styles.label}>密码:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="password2" style={styles.label}>确认密码:</label>
                    <input
                        type="password"
                        id="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? '注册中...' : '注册'}
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;