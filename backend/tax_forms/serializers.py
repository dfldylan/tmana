from rest_framework import serializers
from .models import TaxForm, TaxInfo, DailyManagement, Collection, TaxPaymentWithAssets

class DailyManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyManagement
        fields = ['reminders', 'invoice_control', 'risk_alerts', 'interview', 
                  'tax_payment_plan', 'taxpayer_report', 'taxpayer_assets']
        depth = 1  # 处理嵌套关系

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
        collection_data = validated_data.pop('collection', {})
        tax_payment_with_assets_data = validated_data.pop('tax_payment_with_assets', {})
        
        # 创建主表单记录
        tax_form = TaxForm.objects.create(**validated_data)
        
        # 创建关联记录
        TaxInfo.objects.create(tax_form=tax_form, **tax_info_data)
        DailyManagement.objects.create(tax_form=tax_form, **daily_management_data)
        Collection.objects.create(tax_form=tax_form, **collection_data)
        TaxPaymentWithAssets.objects.create(tax_form=tax_form, **tax_payment_with_assets_data)
        
        return tax_form
    
    def update(self, instance, validated_data):
        """处理嵌套数据的更新"""
        # 处理嵌套关联数据
        if 'tax_info' in validated_data:
            tax_info_data = validated_data.pop('tax_info')
            tax_info = instance.tax_info
            for attr, value in tax_info_data.items():
                setattr(tax_info, attr, value)
            tax_info.save()
        
        if 'daily_management' in validated_data:
            daily_management_data = validated_data.pop('daily_management')
            daily_management = instance.daily_management
            for attr, value in daily_management_data.items():
                setattr(daily_management, attr, value)
            daily_management.save()
        
        if 'collection' in validated_data:
            collection_data = validated_data.pop('collection')
            collection = instance.collection
            for attr, value in collection_data.items():
                setattr(collection, attr, value)
            collection.save()
        
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
