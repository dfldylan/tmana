import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { taxForms as taxFormsApi } from '../services/api';
import { TaxForm } from '../types/taxTypes'; // Import the updated TaxForm
import './Main.css';

const Main: React.FC = () => {
  const [data, setData] = useState<TaxForm[]>([]); // Use imported TaxForm
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await taxFormsApi.getAllForms();
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch tax forms:", err);
        setError("无法加载税务数据，请检查API连接或稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns: ColumnsType<TaxForm> = [
    {
      title: '基本信息',
      key: 'basicInfo',
      // fixed: 'left', // 如果希望基本信息列固定在左侧，可以取消注释
      children: [
        { title: '序号', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id, ellipsis: true },
        { title: '月度', dataIndex: 'month', key: 'month', sorter: (a, b) => a.month.localeCompare(b.month), ellipsis: true },
        { title: '纳税人名称', dataIndex: 'taxpayer_name', key: 'taxpayer_name', ellipsis: true },
        { title: '统一社会信用代码', dataIndex: 'credit_code', key: 'credit_code', ellipsis: true },
        { title: '纳税人状态', dataIndex: 'taxpayer_status', key: 'taxpayer_status', ellipsis: true },
        { title: '所属行业', dataIndex: 'industry', key: 'industry', ellipsis: true },
        { title: '主管税务机关代码', dataIndex: 'tax_authority_code', key: 'tax_authority_code', ellipsis: true },
        { title: '主管税务所名称', dataIndex: 'tax_authority_name', key: 'tax_authority_name', ellipsis: true },
        { title: '表单状态', dataIndex: 'status', key: 'status', ellipsis: true },
      ],
    },
    {
      title: '欠税信息',
      key: 'taxInfoGroup',
      children: [
        { title: '截至目前欠缴税费情况', dataIndex: ['tax_info', 'outstanding_tax'], key: 'outstanding_tax', render: val => val?.toLocaleString(), ellipsis: true },
        { title: '涉及税费种', dataIndex: ['tax_info', 'tax_types'], key: 'tax_types', ellipsis: true },
        { title: '清欠成效', dataIndex: ['tax_info', 'collection_effect'], key: 'collection_effect', render: val => val?.toLocaleString(), ellipsis: true },
      ],
    },
    {
      title: '日常管理',
      key: 'dailyManagementGroup',
      children: [
        { title: '催缴提醒文书', dataIndex: ['daily_management', 'reminders'], key: 'dm_reminders', ellipsis: true },
        { title: '发票管控', dataIndex: ['daily_management', 'invoice_control'], key: 'dm_invoice_control', ellipsis: true },
        {
          title: '风险提醒',
          key: 'dm_riskAlertsGroup',
          children: [
            { title: '提醒文书', key: 'dm_ra_document', render: (_, record) => record.daily_management?.risk_alerts?.[0]?.document, ellipsis: true },
            { title: '送达时间', key: 'dm_ra_delivery_date', render: (_, record) => record.daily_management?.risk_alerts?.[0]?.delivery_date, ellipsis: true },
          ],
        },
        {
          title: '约谈警示',
          key: 'dm_interviewGroup',
          children: [
            { title: '是否约谈', dataIndex: ['daily_management', 'interview', 'has_interview'], key: 'dm_i_has_interview', render: (val) => val ? '是' : '否', ellipsis: true },
            { title: '约谈文书', dataIndex: ['daily_management', 'interview', 'document'], key: 'dm_i_document', ellipsis: true },
            { title: '约谈时间', dataIndex: ['daily_management', 'interview', 'interview_date'], key: 'dm_i_interview_date', ellipsis: true },
          ],
        },
        {
          title: '清缴欠税计划',
          key: 'dm_taxPaymentPlanGroup',
          children: [
            { title: '有无订立', dataIndex: ['daily_management', 'tax_payment_plan', 'has_agreement'], key: 'dm_tpp_has_agreement', render: (val) => val ? '是' : '否', ellipsis: true },
            { title: '分期情况(月)', dataIndex: ['daily_management', 'tax_payment_plan', 'month_count'], key: 'dm_tpp_month_count', ellipsis: true },
            { title: '本期执行情况', dataIndex: ['daily_management', 'tax_payment_plan', 'current_execution'], key: 'dm_tpp_current_execution', ellipsis: true },
            { title: '未按期履行原因', dataIndex: ['daily_management', 'tax_payment_plan', 'unfulfilled_reason'], key: 'dm_tpp_unfulfilled_reason', ellipsis: true },
          ],
        },
        {
          title: '欠税人报告事项',
          key: 'dm_taxpayerReportGroup',
          children: [
            { title: '定期报告', dataIndex: ['daily_management', 'taxpayer_report', 'periodic_report'], key: 'dm_tr_periodic_report', ellipsis: true },
            { title: '处置资产报告', dataIndex: ['daily_management', 'taxpayer_report', 'asset_disposal_report'], key: 'dm_tr_asset_disposal_report', ellipsis: true },
            { title: '合并分立报告', dataIndex: ['daily_management', 'taxpayer_report', 'merger_division_report'], key: 'dm_tr_merger_division_report', ellipsis: true },
          ],
        },
        {
          title: '纳税人资产情况',
          key: 'dm_taxpayerAssetsGroup',
          children: [
            { title: '存款账户情况', dataIndex: ['daily_management', 'taxpayer_assets', 'bank_accounts'], key: 'dm_ta_bank_accounts', ellipsis: true },
            { title: '不动产信息', dataIndex: ['daily_management', 'taxpayer_assets', 'real_estate'], key: 'dm_ta_real_estate', ellipsis: true },
            { title: '机动车信息', dataIndex: ['daily_management', 'taxpayer_assets', 'vehicles'], key: 'dm_ta_vehicles', ellipsis: true },
            { title: '其他资产信息', dataIndex: ['daily_management', 'taxpayer_assets', 'other_assets'], key: 'dm_ta_other_assets', ellipsis: true },
          ],
        },
      ],
    },
    {
      title: '抵缴欠税情况',
      key: 'taxPaymentWithAssetsGroup',
      children: [
        { title: '抵缴欠税描述', dataIndex: ['tax_payment_with_assets', 'description'], key: 'tpwa_description', ellipsis: true },
      ],
    },
    {
      title: '欠税追征',
      key: 'collectionGroup',
      children: [
        { title: '纳税担保', dataIndex: ['collection', 'guarantees'], key: 'c_guarantees', ellipsis: true },
        { title: '冻结', dataIndex: ['collection', 'freezing'], key: 'c_freezing', ellipsis: true },
        { title: '查封、扣押', dataIndex: ['collection', 'seizures'], key: 'c_seizures', ellipsis: true },
        { title: '催告', dataIndex: ['collection', 'reminders'], key: 'c_reminders', ellipsis: true },
        { title: '强制扣缴', dataIndex: ['collection', 'forced_collection'], key: 'c_forced_collection', ellipsis: true },
        { title: '拍卖、变卖', dataIndex: ['collection', 'auction'], key: 'c_auction', ellipsis: true },
        { title: '申请人民法院强制执行', dataIndex: ['collection', 'court_execution'], key: 'c_court_execution', ellipsis: true },
        { title: '行使代位权、撤销权', dataIndex: ['collection', 'rights_exercise'], key: 'c_rights_exercise', ellipsis: true },
        { title: '阻止出境', dataIndex: ['collection', 'exit_prevention'], key: 'c_exit_prevention', ellipsis: true },
        { title: '限制出境信息', dataIndex: ['collection', 'prohibited_departure'], key: 'c_prohibited_departure', ellipsis: true },
      ],
    },
  ];

  if (error) {
    return <div className="page-container error-message">错误: {error}</div>;
  }

  return (
    <div className="page-container">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true, // 允许用户改变每页条数
          pageSizeOptions: ['10', '20', '50', '100'], // 可选的每页条数
          showQuickJumper: true, // 允许快速跳转到某页
          showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`, // 显示总条数
        }}
        size="middle" // 可以尝试 "small", "middle", "large"
        title={() => <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>税务管理总览</h1>} // 使用 Table 的 title 属性
        sticky // 尝试表头吸顶效果
      />
    </div>
  );
};

export default Main;