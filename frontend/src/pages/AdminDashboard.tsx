import React from 'react';
import AdminPanel from '../components/AdminPanel';
import FormTable from '../components/FormTable';

const AdminDashboard: React.FC = () => {
    return (
        <div>
            <h1>管理员仪表板</h1>
            <AdminPanel />
            <FormTable data={[]} />
        </div>
    );
};

export default AdminDashboard;