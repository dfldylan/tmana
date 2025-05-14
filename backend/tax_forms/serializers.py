from rest_framework import serializers
from .models import (
    TaxForm, TaxInfo, DailyManagement, Collection, TaxPaymentWithAssets,
    RiskAlert, Interview, TaxPaymentPlan, TaxpayerReport, TaxpayerAssets
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
    risk_alerts = RiskAlertSerializer(many=True, required=False)
    interview = InterviewSerializer(required=False)
    tax_payment_plan = TaxPaymentPlanSerializer(required=False)
    taxpayer_report = TaxpayerReportSerializer(required=False)
    taxpayer_assets = TaxpayerAssetsSerializer(required=False)
    
    class Meta:
        model = DailyManagement
        fields = ['reminders', 'invoice_control', 'risk_alerts', 'interview', 
                  'tax_payment_plan', 'taxpayer_report', 'taxpayer_assets']

class TaxInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxInfo
        fields = ['outstanding_tax', 'tax_types', 'collection_effect']

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['guarantees', 'freezing', 'seizures', 'reminders',
                  'forced_collection', 'auction', 'court_execution',
                  'rights_exercise', 'exit_prevention', 'prohibited_departure']

class TaxPaymentWithAssetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxPaymentWithAssets
        fields = ['description']

class TaxFormSerializer(serializers.ModelSerializer):
    tax_info = TaxInfoSerializer()
    daily_management = DailyManagementSerializer()
    collection = CollectionSerializer()
    tax_payment_with_assets = TaxPaymentWithAssetsSerializer()
    
    class Meta:
        model = TaxForm
        fields = ['id', 'month', 'taxpayer_name', 'credit_code', 'taxpayer_status',
                  'industry', 'tax_authority_code', 'tax_authority_name',
                  'status', 'created_at', 'updated_at', 'tax_info',
                  'daily_management', 'collection', 'tax_payment_with_assets']
                  
    def create(self, validated_data):
        """处理嵌套数据的创建"""
        tax_info_data = validated_data.pop('tax_info', {})
        daily_management_data = validated_data.pop('daily_management', {})
        risk_alerts_data = daily_management_data.pop('risk_alerts', [])
        interview_data = daily_management_data.pop('interview', {})
        tax_payment_plan_data = daily_management_data.pop('tax_payment_plan', {})
        taxpayer_report_data = daily_management_data.pop('taxpayer_report', {})
        taxpayer_assets_data = daily_management_data.pop('taxpayer_assets', {})
        
        collection_data = validated_data.pop('collection', {})
        tax_payment_with_assets_data = validated_data.pop('tax_payment_with_assets', {})
        
        # 创建主表单记录
        tax_form = TaxForm.objects.create(**validated_data)
        
        # 创建关联记录
        TaxInfo.objects.create(tax_form=tax_form, **tax_info_data)
        daily_management = DailyManagement.objects.create(tax_form=tax_form, **daily_management_data)
        
        # 创建日常管理相关的嵌套记录
        for risk_alert_data in risk_alerts_data:
            RiskAlert.objects.create(daily_management=daily_management, **risk_alert_data)
        
        if interview_data:
            Interview.objects.create(daily_management=daily_management, **interview_data)
            
        if tax_payment_plan_data:
            TaxPaymentPlan.objects.create(daily_management=daily_management, **tax_payment_plan_data)
            
        if taxpayer_report_data:
            TaxpayerReport.objects.create(daily_management=daily_management, **taxpayer_report_data)
            
        if taxpayer_assets_data:
            TaxpayerAssets.objects.create(daily_management=daily_management, **taxpayer_assets_data)
        
        Collection.objects.create(tax_form=tax_form, **collection_data)
        TaxPaymentWithAssets.objects.create(tax_form=tax_form, **tax_payment_with_assets_data)
        
        return tax_form
    
    def update(self, instance, validated_data):
        """处理嵌套数据的更新"""
        # 处理税务信息更新
        if 'tax_info' in validated_data:
            tax_info_data = validated_data.pop('tax_info')
            tax_info = instance.tax_info
            for attr, value in tax_info_data.items():
                setattr(tax_info, attr, value)
            tax_info.save()
        
        # 处理日常管理更新
        if 'daily_management' in validated_data:
            daily_management_data = validated_data.pop('daily_management')
            daily_management = instance.daily_management
            
            # 处理风险提醒更新
            if 'risk_alerts' in daily_management_data:
                risk_alerts_data = daily_management_data.pop('risk_alerts')
                # 删除现有的风险提醒并创建新的
                daily_management.risk_alerts.all().delete()
                for risk_alert_data in risk_alerts_data:
                    RiskAlert.objects.create(daily_management=daily_management, **risk_alert_data)
            
            # 处理约谈警示更新
            if 'interview' in daily_management_data:
                interview_data = daily_management_data.pop('interview')
                interview = daily_management.interview
                if interview:
                    for attr, value in interview_data.items():
                        setattr(interview, attr, value)
                    interview.save()
                else:
                    Interview.objects.create(daily_management=daily_management, **interview_data)
            
            # 处理清缴欠税计划更新
            if 'tax_payment_plan' in daily_management_data:
                tax_payment_plan_data = daily_management_data.pop('tax_payment_plan')
                plan = daily_management.tax_payment_plan
                if plan:
                    for attr, value in tax_payment_plan_data.items():
                        setattr(plan, attr, value)
                    plan.save()
                else:
                    TaxPaymentPlan.objects.create(daily_management=daily_management, **tax_payment_plan_data)
            
            # 处理欠税人报告事项更新
            if 'taxpayer_report' in daily_management_data:
                taxpayer_report_data = daily_management_data.pop('taxpayer_report')
                report = daily_management.taxpayer_report
                if report:
                    for attr, value in taxpayer_report_data.items():
                        setattr(report, attr, value)
                    report.save()
                else:
                    TaxpayerReport.objects.create(daily_management=daily_management, **taxpayer_report_data)
            
            # 处理纳税人资产情况更新
            if 'taxpayer_assets' in daily_management_data:
                taxpayer_assets_data = daily_management_data.pop('taxpayer_assets')
                assets = daily_management.taxpayer_assets
                if assets:
                    for attr, value in taxpayer_assets_data.items():
                        setattr(assets, attr, value)
                    assets.save()
                else:
                    TaxpayerAssets.objects.create(daily_management=daily_management, **taxpayer_assets_data)
            
            # 更新日常管理本身
            for attr, value in daily_management_data.items():
                setattr(daily_management, attr, value)
            daily_management.save()
        
        # 处理欠税追征更新
        if 'collection' in validated_data:
            collection_data = validated_data.pop('collection')
            collection = instance.collection
            for attr, value in collection_data.items():
                setattr(collection, attr, value)
            collection.save()
        
        # 处理抵缴欠税情况更新
        if 'tax_payment_with_assets' in validated_data:
            tax_payment_data = validated_data.pop('tax_payment_with_assets')
            tax_payment = instance.tax_payment_with_assets
            for attr, value in tax_payment_data.items():
                setattr(tax_payment, attr, value)
            tax_payment.save()
        
        # 更新主表单
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
