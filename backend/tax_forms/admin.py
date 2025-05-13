from django.contrib import admin
from .models import (
    TaxForm, TaxInfo, DailyManagement, RiskAlert, Interview,
    TaxPaymentPlan, TaxpayerReport, TaxpayerAssets,
    Collection, TaxPaymentWithAssets
)

class TaxInfoInline(admin.StackedInline):
    model = TaxInfo
    can_delete = False

class DailyManagementInline(admin.StackedInline):
    model = DailyManagement
    can_delete = False

class CollectionInline(admin.StackedInline):
    model = Collection
    can_delete = False

class TaxPaymentWithAssetsInline(admin.StackedInline):
    model = TaxPaymentWithAssets
    can_delete = False

@admin.register(TaxForm)
class TaxFormAdmin(admin.ModelAdmin):
    list_display = ('id', 'month', 'taxpayer_name', 'credit_code', 'taxpayer_status', 'status')
    list_filter = ('month', 'taxpayer_status', 'status')
    search_fields = ('taxpayer_name', 'credit_code')
    inlines = [TaxInfoInline, DailyManagementInline, CollectionInline, TaxPaymentWithAssetsInline]

@admin.register(RiskAlert)
class RiskAlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_taxpayer_name', 'document', 'delivery_date')
    search_fields = ('document', 'daily_management__tax_form__taxpayer_name')
    
    def get_taxpayer_name(self, obj):
        return obj.daily_management.tax_form.taxpayer_name
    get_taxpayer_name.short_description = '纳税人名称'

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_taxpayer_name', 'has_interview', 'document', 'interview_date')
    list_filter = ('has_interview',)
    
    def get_taxpayer_name(self, obj):
        return obj.daily_management.tax_form.taxpayer_name
    get_taxpayer_name.short_description = '纳税人名称'

@admin.register(TaxPaymentPlan)
class TaxPaymentPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_taxpayer_name', 'has_agreement', 'month_count')
    list_filter = ('has_agreement',)
    
    def get_taxpayer_name(self, obj):
        return obj.daily_management.tax_form.taxpayer_name
    get_taxpayer_name.short_description = '纳税人名称'

@admin.register(TaxpayerReport)
class TaxpayerReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_taxpayer_name')
    
    def get_taxpayer_name(self, obj):
        return obj.daily_management.tax_form.taxpayer_name
    get_taxpayer_name.short_description = '纳税人名称'

@admin.register(TaxpayerAssets)
class TaxpayerAssetsAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_taxpayer_name')
    
    def get_taxpayer_name(self, obj):
        return obj.daily_management.tax_form.taxpayer_name
    get_taxpayer_name.short_description = '纳税人名称'

# 其他模型也可以根据需要注册，这里只展示主要的几个
