import React, { useEffect, useState } from 'react';
import { fetchUserForms } from '../services/api';
import FormTable from '../components/FormTable';
import { TaxForm } from '../types/taxTypes';

const UserDashboard: React.FC = () => {
    const [forms, setForms] = useState<TaxForm[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadForms = async () => {
            try {
                const userForms = await fetchUserForms();
                setForms(userForms.data);  // 使用 response.data 获取实际数据
            } catch (err) {
                setError('无法加载表单数据');
            } finally {
                setLoading(false);
            }
        };

        loadForms();
    }, []);

    if (loading) {
        return <div>加载中...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>用户仪表盘</h1>
            <FormTable data={forms} />
        </div>
    );
};

export default UserDashboard;