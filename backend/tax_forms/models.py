from django.db import models
from django.utils import timezone
import datetime

class TaxForm(models.Model):
    """税务表单模型"""
    TAXPAYER_STATUS_CHOICES = [
        ('正常', '正常'),
        ('⾮正常', '⾮正常'),
        ('注销', '注销'),
        ('非正常注销', '非正常注销'),
        ('报验', '报验'),
        ('核销报验', '核销报验'),
    ]
    
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('assigned', '已分配'),
        ('submitted', '已提交'),
        ('approved', '已审批'),
    ]
    
    id = models.AutoField(primary_key=True, verbose_name='序号')
    month = models.CharField(max_length=6, verbose_name='月度', 
                            default=datetime.datetime.now().strftime('%Y%m'))
    taxpayer_name = models.CharField(max_length=255, verbose_name='纳税人名称')
    credit_code = models.CharField(max_length=18, verbose_name='统一社会信用代码')
    taxpayer_status = models.CharField(max_length=20, choices=TAXPAYER_STATUS_CHOICES, 
                                     verbose_name='纳税人状态', default='正常')
    industry = models.CharField(max_length=255, verbose_name='所属行业')
    tax_authority_code = models.CharField(max_length=11, verbose_name='主管税务机关代码')
    tax_authority_name = models.CharField(max_length=255, verbose_name='主管税务所名称')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='最后更新时间')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', 
                             verbose_name='表单状态')
    
    class Meta:
        verbose_name = '税务表单'
        verbose_name_plural = '税务表单'
        indexes = [
            models.Index(fields=['credit_code']),
            models.Index(fields=['month']),
            models.Index(fields=['taxpayer_name']),
        ]
    
    def __str__(self):
        return f"{self.taxpayer_name} - {self.month}"


class TaxInfo(models.Model):
    """欠税信息模型"""
    id = models.AutoField(primary_key=True)
    tax_form = models.OneToOneField(TaxForm, on_delete=models.CASCADE, related_name='tax_info', 
                                  verbose_name='关联的税务表单')
    outstanding_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, 
                                        verbose_name='截至目前欠缴税费情况')
    tax_types = models.TextField(verbose_name='涉及税费种')
    collection_effect = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, 
                                          verbose_name='清欠成效')
    
    class Meta:
        verbose_name = '欠税信息'
        verbose_name_plural = '欠税信息'
    
    def __str__(self):
        return f"{self.tax_form.taxpayer_name}的欠税信息"


class DailyManagement(models.Model):
    """日常管理模型"""
    INVOICE_CONTROL_CHOICES = [
        ('未控票', '未控票'),
        ('控票中', '控票中'),
        ('数电票已限额', '数电票已限额'),
        ('拟列入', '拟列入'),
        ('限量供应', '限量供应'),
        ('停止控票', '停止控票'),
        ('暂停控票', '暂停控票'),
    ]
    
    id = models.AutoField(primary_key=True)
    tax_form = models.OneToOneField(TaxForm, on_delete=models.CASCADE, related_name='daily_management', 
                                  verbose_name='关联的税务表单')
    reminders = models.TextField(verbose_name='催缴提醒文书')
    invoice_control = models.CharField(max_length=20, choices=INVOICE_CONTROL_CHOICES, 
                                     default='未控票', verbose_name='发票管控')
    
    class Meta:
        verbose_name = '日常管理'
        verbose_name_plural = '日常管理'
    
    def __str__(self):
        return f"{self.tax_form.taxpayer_name}的日常管理"


class RiskAlert(models.Model):
    """风险提醒模型"""
    id = models.AutoField(primary_key=True)
    daily_management = models.ForeignKey(DailyManagement, on_delete=models.CASCADE, 
                                       related_name='risk_alerts', verbose_name='关联的日常管理')
    document = models.CharField(max_length=255, verbose_name='提醒文书')
    delivery_date = models.DateField(verbose_name='送达时间', null=True, blank=True)
    
    class Meta:
        verbose_name = '风险提醒'
        verbose_name_plural = '风险提醒'
    
    def __str__(self):
        return f"{self.daily_management.tax_form.taxpayer_name}的风险提醒"


class Interview(models.Model):
    """约谈警示模型"""
    YES_NO_CHOICES = [
        (True, '是'),
        (False, '否'),
    ]
    
    id = models.AutoField(primary_key=True)
    daily_management = models.OneToOneField(DailyManagement, on_delete=models.CASCADE, 
                                          related_name='interview', verbose_name='关联的日常管理')
    has_interview = models.BooleanField(choices=YES_NO_CHOICES, default=False, verbose_name='是否约谈')
    document = models.CharField(max_length=255, verbose_name='约谈文书或填写未约谈原因', blank=True)
    interview_date = models.DateField(verbose_name='约谈时间', null=True, blank=True)
    
    class Meta:
        verbose_name = '约谈警示'
        verbose_name_plural = '约谈警示'
    
    def __str__(self):
        return f"{self.daily_management.tax_form.taxpayer_name}的约谈警示"


class TaxPaymentPlan(models.Model):
    """清缴欠税计划模型"""
    YES_NO_CHOICES = [
        (True, '是'),
        (False, '否'),
    ]
    
    id = models.AutoField(primary_key=True)
    daily_management = models.OneToOneField(DailyManagement, on_delete=models.CASCADE, 
                                          related_name='tax_payment_plan', verbose_name='关联的日常管理')
    has_agreement = models.BooleanField(choices=YES_NO_CHOICES, default=False, verbose_name='有无订立')
    month_count = models.IntegerField(default=0, verbose_name='分期情况')
    current_execution = models.CharField(max_length=255, default='0', verbose_name='本期执行情况')
    unfulfilled_reason = models.TextField(default='无', verbose_name='未按期履行原因')
    
    class Meta:
        verbose_name = '清缴欠税计划'
        verbose_name_plural = '清缴欠税计划'
    
    def __str__(self):
        return f"{self.daily_management.tax_form.taxpayer_name}的清缴欠税计划"


class TaxpayerReport(models.Model):
    """欠税人报告事项模型"""
    id = models.AutoField(primary_key=True)
    daily_management = models.OneToOneField(DailyManagement, on_delete=models.CASCADE, 
                                          related_name='taxpayer_report', verbose_name='关联的日常管理')
    periodic_report = models.TextField(default='无', verbose_name='定期报告')
    asset_disposal_report = models.TextField(default='无', verbose_name='处置资产报告')
    merger_division_report = models.TextField(default='无', verbose_name='合并分立报告')
    
    class Meta:
        verbose_name = '欠税人报告事项'
        verbose_name_plural = '欠税人报告事项'
    
    def __str__(self):
        return f"{self.daily_management.tax_form.taxpayer_name}的欠税人报告事项"


class TaxpayerAssets(models.Model):
    """纳税人资产情况模型"""
    id = models.AutoField(primary_key=True)
    daily_management = models.OneToOneField(DailyManagement, on_delete=models.CASCADE, 
                                          related_name='taxpayer_assets', verbose_name='关联的日常管理')
    bank_accounts = models.TextField(default='无', verbose_name='存款账户情况')
    real_estate = models.TextField(default='无', verbose_name='不动产信息')
    vehicles = models.TextField(default='无', verbose_name='机动车（船舶）信息')
    other_assets = models.TextField(default='无', verbose_name='其他资产信息')
    
    class Meta:
        verbose_name = '纳税人资产情况'
        verbose_name_plural = '纳税人资产情况'
    
    def __str__(self):
        return f"{self.daily_management.tax_form.taxpayer_name}的纳税人资产情况"


class Collection(models.Model):
    """欠税追征模型"""
    id = models.AutoField(primary_key=True)
    tax_form = models.OneToOneField(TaxForm, on_delete=models.CASCADE, related_name='collection', 
                                  verbose_name='关联的税务表单')
    guarantees = models.TextField(default='无', verbose_name='纳税担保')
    freezing = models.TextField(default='无', verbose_name='冻结')
    seizures = models.TextField(default='无', verbose_name='查封、扣押')
    reminders = models.TextField(default='无', verbose_name='催告')
    forced_collection = models.TextField(default='无', verbose_name='强制扣缴（金额）')
    auction = models.TextField(default='无', verbose_name='拍卖、变卖（金额）')
    court_execution = models.TextField(default='无', verbose_name='申请人民法院强制执行')
    rights_exercise = models.TextField(default='无', verbose_name='行使代位权、撤销权')
    exit_prevention = models.TextField(default='无', verbose_name='阻止出境')
    prohibited_departure = models.CharField(max_length=255, default='无', verbose_name='限制出境信息')
    
    class Meta:
        verbose_name = '欠税追征'
        verbose_name_plural = '欠税追征'
    
    def __str__(self):
        return f"{self.tax_form.taxpayer_name}的欠税追征"


class TaxPaymentWithAssets(models.Model):
    """抵缴欠税情况模型"""
    id = models.AutoField(primary_key=True)
    tax_form = models.OneToOneField(TaxForm, on_delete=models.CASCADE, 
                                  related_name='tax_payment_with_assets', verbose_name='关联的税务表单')
    description = models.TextField(default='无', verbose_name='抵缴欠税情况描述')
    
    class Meta:
        verbose_name = '抵缴欠税情况'
        verbose_name_plural = '抵缴欠税情况'
    
    def __str__(self):
        return f"{self.tax_form.taxpayer_name}的抵缴欠税情况"