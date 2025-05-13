<style>
  table {
    min-width: 610px; 设置表格最小总宽度
  }
  th:nth-child(1) { width: 150px; }  /* 一级字段 */
  th:nth-child(2) { width: 100px; }  /* 二级字段 */
  th:nth-child(3) { width: 140px; }  /* 三级字段 */
  th:nth-child(4) { width: 80px; }   /* 类型 */
  th:nth-child(5) { width: 50px; }   /* 类型 */
</style>

# 税务管理系统数据库设计文档

## 概述

本文档描述了税务管理系统的数据库结构设计，包括表结构、字段定义以及表之间的关系。系统采用Django ORM管理数据库，默认使用SQLite数据库（可在生产环境中替换为PostgreSQL或MySQL等）。

## 表结构设计

### 用户模型 (User)

用于存储系统用户信息，扩展自Django的AbstractUser模型。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | BigAutoField | 主键 | 系统 | - |
| username | CharField | 用户名，唯一 | 管理员 | - |
| password | CharField | 密码，加密存储 | 管理员/用户 | - |
| email | EmailField | 邮箱地址 | 管理员/用户 | - |
| user_type | CharField | 用户类型，选项：'admin'管理员，'user'普通用户 | 管理员 | 'user' |
| is_active | BooleanField | 账户是否激活 | 管理员 | True |
| is_staff | BooleanField | 是否可访问管理后台 | 系统 | False |
| date_joined | DateTimeField | 注册日期 | 系统 | - |

### 税务表单模型 (TaxForm)

存储税务表单的主要信息。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键，序号 | 系统 | - |
| month | CharField | 月度，格式如"202503" | 管理员 | 当前年月 |
| taxpayer_name | CharField | 纳税人名称 | 管理员 |  |
| credit_code | CharField | 统一社会信用代码，18位 | 管理员 |  |
| taxpayer_status | CharField | 纳税人状态，枚举类型 | 管理员 | '正常' |
| industry | CharField | 所属行业 | 管理员 |  |
| tax_authority_code | CharField | 主管税务机关代码，11位（分配给哪个用户填写） | 管理员 |  |
| tax_authority_name | CharField | 主管税务所名称 | 管理员 |  |
| created_at | DateTimeField | 创建时间 | 系统 | - |
| updated_at | DateTimeField | 最后更新时间 | 系统 | - |
| status | CharField | 表单状态：'draft'草稿，'assigned'已分配，'submitted'已提交，'approved'已审批 | 系统 | 'draft' |

### 欠税信息模型 (TaxInfo)

存储税务表单中的欠税信息部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| tax_form | OneToOneField | 关联的税务表单 | 系统 | - |
| outstanding_tax | DecimalField | 截至目前欠缴税费情况，保留2位小数 | 管理员 | 0.00 |
| tax_types | TextField | 涉及税费种 | 管理员 |  |
| collection_effect | DecimalField | 清欠成效，保留2位小数 | 管理员 | 0.00 |

### 日常管理模型 (DailyManagement)

存储税务表单中的日常管理部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| tax_form | OneToOneField | 关联的税务表单 | 系统 | - |
| reminders | TextField | 催缴提醒文书 | 管理员 |  |
| invoice_control | CharField | 发票管控，枚举类型：'未控票'、'控票中'、'数电票已限额'、'拟列入'、'限量供应'、'停止控票'、'暂停控票' | 用户 | '未控票' |

### 风险提醒模型 (RiskAlert)

存储日常管理中的风险提醒部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| daily_management | ForeignKey | 关联的日常管理 | 系统 | - |
| document | CharField | 提醒文书 | 用户 |  |
| delivery_date | DateField | 送达时间 | 用户 |  |

### 约谈警示模型 (Interview)

存储日常管理中的约谈警示部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| daily_management | OneToOneField | 关联的日常管理 | 系统 | - |
| has_interview | BooleanField | 是否约谈 | 用户 | False |
| document | CharField | 约谈文书或填写未约谈原因 | 用户 |  |
| interview_date | DateField | 约谈时间 | 用户 | - |

### 清缴欠税计划模型 (TaxPaymentPlan)

存储日常管理中的清缴欠税计划部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| daily_management | OneToOneField | 关联的日常管理 | 系统 | - |
| has_agreement | BooleanField | 有无订立 | 用户 | False |
| month_count | IntegerField | 分期情况，月份数 | 用户 | 0 |
| current_execution | CharField | 本期执行情况 | 用户 | 0 |
| unfulfilled_reason | TextField | 未按期履行原因 | 用户 | 无 |

### 欠税人报告事项模型 (TaxpayerReport)

存储日常管理中的欠税人报告事项部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| daily_management | OneToOneField | 关联的日常管理 | 系统 | - |
| periodic_report | TextField | 定期报告 | 用户 | 无 |
| asset_disposal_report | TextField | 处置资产报告 | 用户 | 无 |
| merger_division_report | TextField | 合并分立报告 | 用户 | 无 |

### 纳税人资产情况模型 (TaxpayerAssets)

存储日常管理中的纳税人资产情况部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| daily_management | OneToOneField | 关联的日常管理 | 系统 | - |
| bank_accounts | TextField | 存款账户情况 | 用户 | 无 |
| real_estate | TextField | 不动产信息 | 用户 | 无 |
| vehicles | TextField | 机动车（船舶）信息 | 用户 | 无 |
| other_assets | TextField | 其他资产信息 | 用户 | 无 |

### 欠税追征模型 (Collection)

存储税务表单中的欠税追征部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| tax_form | OneToOneField | 关联的税务表单 | 系统 | - |
| guarantees | TextField | 纳税担保 | 用户 | 无 |
| freezing | TextField | 冻结 | 用户 | 无 |
| seizures | TextField | 查封、扣押 | 用户 | 无 |
| reminders | TextField | 催告 | 用户 | 无 |
| forced_collection | TextField | 强制扣缴（金额） | 用户 | 无 |
| auction | TextField | 拍卖、变卖（金额） | 用户 | 无 |
| court_execution | TextField | 申请人民法院强制执行 | 用户 | 无 |
| rights_exercise | TextField | 行使代位权、撤销权 | 用户 | 无 |
| exit_prevention | TextField | 阻止出境 | 管理员 | 无 |
| prohibited_departure | CharField | 限制出境信息 | 管理员 | 无 |

### 抵缴欠税情况模型 (TaxPaymentWithAssets)

存储税务表单中的抵缴欠税情况部分。

| 字段名 | 类型 | 说明 | 填写方 | 默认值 |
|--------|------|------|--------|--------|
| id | AutoField | 主键 | 系统 | - |
| tax_form | OneToOneField | 关联的税务表单 | 系统 | - |
| description | TextField | 抵缴欠税情况描述 | 用户 | 无 |

