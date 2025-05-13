export interface TaxInfo {
    id?: number; // serializers include id
    outstanding_tax: number;
    tax_types: string;
    collection_effect: number;
}

export interface RiskAlert {
    id?: number; // serializers include id
    document: string;
    delivery_date: string; 
}

export interface Interview {
    id?: number; // serializers include id
    has_interview: boolean; // Changed from "是" | "否" to boolean to match serializer
    document: string;
    interview_date: string; 
}

export interface TaxPaymentPlan {
    id?: number; // serializers include id
    has_agreement: boolean; // Changed from "是" | "否" to boolean to match serializer
    month_count: number;
    current_execution: string;
    unfulfilled_reason: string;
}

export interface TaxpayerReport {
    id?: number; // serializers include id
    periodic_report: string;
    asset_disposal_report: string;
    merger_division_report: string;
}

export interface TaxpayerAssets {
    id?: number; // serializers include id
    bank_accounts: string;
    real_estate: string;
    vehicles: string;
    other_assets: string;
}

export interface DailyManagement {
    id?: number; // serializers include id
    reminders: string;
    invoice_control: "未控票" | "控票中" | "数电票已限额" | "拟列入" | "限量供应" | "停止控票" | "暂停控票"; // Keep as is if this is how it's sent/received
    risk_alerts: RiskAlert[];
    interview?: Interview | null; // Serializer has this as a single object, can be null
    tax_payment_plan?: TaxPaymentPlan | null; // Serializer has this as a single object, can be null
    taxpayer_report?: TaxpayerReport | null; // Serializer has this as a single object, can be null
    taxpayer_assets?: TaxpayerAssets | null; // Serializer has this as a single object, can be null
}

export interface Collection {
    id?: number; // serializers include id
    guarantees: string;
    freezing: string;
    seizures: string;
    reminders: string;
    forced_collection: string;
    auction: string;
    court_execution: string;
    rights_exercise: string;
    exit_prevention: string;
    prohibited_departure: string;
}

export interface TaxPaymentWithAssets { // New interface to match serializer
    id?: number;
    description: string;
}

export interface TaxForm {
    id: number;
    month: string;
    taxpayer_name: string; // Was taxpayerName
    credit_code: string;   // Was creditCode
    taxpayer_status: string; // Was taxpayerStatus with enum, now string to match serializer general output
    industry: string;
    tax_authority_code: string; // Was taxOrgCode
    tax_authority_name: string; // Was taxOrgName
    status?: string; // Added based on serializer
    created_at?: string; // Added based on serializer
    updated_at?: string; // Added based on serializer
    
    tax_info: TaxInfo; // Serializer has this as a single object, can be null
    daily_management: DailyManagement; // Serializer has this as a single object, can be null
    tax_payment_with_assets?: TaxPaymentWithAssets | null; // Was string, now object to match serializer
    collection: Collection; // Serializer has this as a single object, can be null
}
