from rest_framework import serializers
from .models import (
    TaxForm, TaxInfo, DailyManagement, RiskAlert, Interview,
    TaxPaymentPlan, TaxpayerReport, TaxpayerAssets,
    Collection, TaxPaymentWithAssets
)

class RiskAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskAlert
        fields = ['id', 'document', 'delivery_date']

class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ['id', 'has_interview', 'document', 'interview_date']

class TaxPaymentPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxPaymentPlan
        fields = ['id', 'has_agreement', 'month_count', 'current_execution', 'unfulfilled_reason']

class TaxpayerReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxpayerReport
        fields = ['id', 'periodic_report', 'asset_disposal_report', 'merger_division_report']

class TaxpayerAssetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxpayerAssets
        fields = ['id', 'bank_accounts', 'real_estate', 'vehicles', 'other_assets']

class DailyManagementSerializer(serializers.ModelSerializer):
    risk_alerts = RiskAlertSerializer(many=True, read_only=True)
    interview = InterviewSerializer(read_only=True)
    tax_payment_plan = TaxPaymentPlanSerializer(read_only=True)
    taxpayer_report = TaxpayerReportSerializer(read_only=True)
    taxpayer_assets = TaxpayerAssetsSerializer(read_only=True)
    
    class Meta:
        model = DailyManagement
        fields = ['id', 'reminders', 'invoice_control', 'risk_alerts', 
                  'interview', 'tax_payment_plan', 'taxpayer_report', 'taxpayer_assets']

class TaxInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxInfo
        fields = ['id', 'outstanding_tax', 'tax_types', 'collection_effect']

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id', 'guarantees', 'freezing', 'seizures', 'reminders', 
                  'forced_collection', 'auction', 'court_execution', 
                  'rights_exercise', 'exit_prevention', 'prohibited_departure']

class TaxPaymentWithAssetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxPaymentWithAssets
        fields = ['id', 'description']

class TaxFormSerializer(serializers.ModelSerializer):
    tax_info = TaxInfoSerializer(read_only=True)
    daily_management = DailyManagementSerializer(read_only=True)
    collection = CollectionSerializer(read_only=True)
    tax_payment_with_assets = TaxPaymentWithAssetsSerializer(read_only=True)
    
    class Meta:
        model = TaxForm
        fields = ['id', 'month', 'taxpayer_name', 'credit_code', 'taxpayer_status', 
                  'industry', 'tax_authority_code', 'tax_authority_name', 
                  'created_at', 'updated_at', 'status', 'tax_info', 
                  'daily_management', 'collection', 'tax_payment_with_assets']
