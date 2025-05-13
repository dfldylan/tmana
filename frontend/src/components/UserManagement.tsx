import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'admin' | 'user';
  is_active: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  return (
    <div>
      <h2>用户管理</h2>
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>类型</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.user_type}</td>
              <td>{user.is_active ? '启用' : '禁用'}</td>
              <td>
                {/* 添加编辑和删除按钮 */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;