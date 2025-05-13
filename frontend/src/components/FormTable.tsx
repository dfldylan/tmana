import React from 'react';
import { TaxForm } from '../types/taxTypes';

interface FormTableProps {
    data: TaxForm[];
}

const FormTable: React.FC<FormTableProps> = ({ data }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>序号</th>
                    <th>月度</th>
                    <th>纳税人名称</th>
                    <th>统一社会信用代码</th>
                    <th>纳税人状态</th>
                    <th>所属行业</th>
                    <th>欠税信息</th>
                    <th>日常管理</th>
                    <th>欠税追征</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.month}</td>
                        <td>{item.taxpayer_name}</td>
                        <td>{item.credit_code}</td>
                        <td>{item.taxpayer_status}</td>
                        <td>{item.industry}</td>
                        <td>{item.tax_info.outstanding_tax}</td>
                        <td>{item.daily_management.reminders}</td>
                        <td>{item.collection.guarantees}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default FormTable;