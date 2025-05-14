import { TaxForm } from '../types/taxTypes';

/**
 * 创建空的税务表单对象，用于新增记录
 * 默认值基于后端 models.py 中的设置
 */
export function createEmptyTaxForm(): TaxForm {
  return {
    id: Date.now(), // 临时ID，保存时后端会替换
    month: new Date().toISOString().slice(0, 7).replace('-', ''), // 当前年月，如"202505"
    taxpayer_name: '示例公司',
    credit_code: '123456789123456789',
    taxpayer_status: '正常', // 默认值与 models.py 中一致
    industry: '示例',
    tax_authority_code: '01234567890',
    tax_authority_name: '示例',
    status: 'draft', // 默认值与 models.py 中一致
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tax_info: {
      outstanding_tax: 0.00, // 默认值与 models.py 中一致
      tax_types: '示例',
      collection_effect: 0.00, // 默认值与 models.py 中一致
    },
    daily_management: {
      reminders: '示例',
      invoice_control: '未控票', // 默认值与 models.py 中一致
      risk_alerts: [{ document: '示例', delivery_date: '示例' }],
      interview: {
        has_interview: false, // 默认值与 models.py 中一致
        document: '示例',
        interview_date: '示例'
      },
      tax_payment_plan: {
        has_agreement: false, // 默认值与 models.py 中一致
        month_count: 0, // 默认值与 models.py 中一致
        current_execution: '0', // 默认值与 models.py 中一致
        unfulfilled_reason: '无' // 默认值与 models.py 中一致
      },
      taxpayer_report: {
        periodic_report: '无', // 默认值与 models.py 中一致
        asset_disposal_report: '无', // 默认值与 models.py 中一致
        merger_division_report: '无' // 默认值与 models.py 中一致
      },
      taxpayer_assets: {
        bank_accounts: '无', // 默认值与 models.py 中一致
        real_estate: '无', // 默认值与 models.py 中一致
        vehicles: '无', // 默认值与 models.py 中一致
        other_assets: '无' // 默认值与 models.py 中一致
      }
    },
    collection: {
      guarantees: '无', // 默认值与 models.py 中一致
      freezing: '无', // 默认值与 models.py 中一致
      seizures: '无', // 默认值与 models.py 中一致
      reminders: '无', // 默认值与 models.py 中一致
      forced_collection: '无', // 默认值与 models.py 中一致
      auction: '无', // 默认值与 models.py 中一致
      court_execution: '无', // 默认值与 models.py 中一致
      rights_exercise: '无', // 默认值与 models.py 中一致
      exit_prevention: '无', // 默认值与 models.py 中一致
      prohibited_departure: '无' // 默认值与 models.py 中一致
    },
    tax_payment_with_assets: {
      description: '无' // 默认值与 models.py 中一致
    }
  };
}