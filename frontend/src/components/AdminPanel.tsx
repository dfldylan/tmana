import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchForms } from '../services/api';
import { TaxForm } from '../types/taxTypes';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [forms, setForms] = useState<TaxForm[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const usersResponse = await fetchUsers();
                const formsResponse = await fetchForms();
                setUsers(usersResponse.data);
                setForms(formsResponse.data);
            } catch (error) {
                console.error('加载数据失败:', error);
            }
        };
        loadData();
    }, []);

    return (
        <div>
            <h1>管理员面板</h1>
            <h2>用户列表</h2>
            <table>
                <thead>
                    <tr>
                        <th>用户ID</th>
                        <th>用户名</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.isActive ? '活跃' : '非活跃'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>表单列表</h2>
            <table>
                <thead>
                    <tr>
                        <th>表单ID</th>
                        <th>表单名称</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    {forms.map(form => (
                        <tr key={form.id}>
                            <td>{form.id}</td>
                            <td>{form.taxpayer_name}</td>
                            <td>{form.taxpayer_status ? '已提交' : '未提交'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;