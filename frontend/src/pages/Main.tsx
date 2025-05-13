import React, { useEffect, useState } from 'react';
import { Table, Layout, Menu, Dropdown, Avatar, Typography, Space, Divider } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { taxForms as taxFormsApi } from '../services/api';
import { TaxForm } from '../types/taxTypes';
import './Main.css';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { Input, InputNumber, DatePicker, Select, Button, message } from 'antd';
import { LogoutOutlined, UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../App';
import { getInitialColumnsConfig } from '../config/columnsConfig';
import { ProcessableColumnType, EditableColumnType, ResizableTitleProps } from '../types/tableTypes';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// 辅助函数：获取嵌套对象的值
function getNestedValue(obj: any, path: (string | number)[]): any {
  let current = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}

// 辅助函数：设置嵌套对象的值，不修改原对象
function setNestedValue(obj: any, path: (string | number)[], value: any): any {
  if (path.length === 0) return value;
  
  const [first, ...rest] = path;
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  
  if (rest.length === 0) {
    newObj[first] = value;
  } else {
    newObj[first] = setNestedValue(
      (first in newObj) ? newObj[first] : (typeof rest[0] === 'number' ? [] : {}),
      rest,
      value
    );
  }
  
  return newObj;
}

// 深拷贝对象，避免直接修改原数据
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  
  const result: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  
  return result as T;
}

const ResizableTitle: React.FC<ResizableTitleProps> = (props) => {
  const { onColumnResize, width, ...restProps } = props;

  if (typeof width !== 'number') {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation(); // Prevent sorting or other header actions
          }}
        />
      }
      onResize={onColumnResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const Main: React.FC = () => {
  // 现有状态
  const [data, setData] = useState<TaxForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 新增状态
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedData, setEditedData] = useState<TaxForm[] | null>(null);
  
  // 使用 useAuth 获取认证信息和登出函数
  const { username, userType, logout } = useAuth();
  
  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      message.success('已成功退出登录');
    } catch (error) {
      console.error('退出登录时出错:', error);
      message.error('退出登录失败，请重试');
    }
  };
  
  // 编辑相关的处理函数
  const handleStartEditing = () => {
    setEditedData(deepClone(data));
    setIsEditing(true);
  };
  
  const handleCancelEditing = () => {
    setEditedData(null);
    setIsEditing(false);
  };
  
  const handleSaveChanges = async () => {
    if (!editedData) return;
    
    setLoading(true);
    try {
      // 这里调用 API 保存更改
      // 例如: await api.updateTaxForms(editedData);
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API调用
      
      setData(editedData); // 更新本地数据
      setIsEditing(false);
      setEditedData(null);
      message.success('保存成功');
    } catch (err) {
      console.error('保存失败:', err);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 从外部配置文件获取列配置
  const initialColumnsConfig = getInitialColumnsConfig();

  // 修改列处理函数，支持编辑功能
  const [tableColumns, setTableColumns] = useState<ColumnsType<TaxForm>>(() => {
    const processCols = (currentCols: ColumnsType<TaxForm>): ColumnsType<TaxForm> => {
      return currentCols.map((col) => {
        const newCol = { ...col } as ProcessableColumnType<TaxForm> & EditableColumnType<TaxForm>;
        
        // 为基础列添加编辑属性（不包含有children的组合列）
        if (!('children' in newCol) && newCol.dataIndex) {
          // 所有列都设为可编辑，使用文本输入框
          newCol.editableBy = 'both';
          newCol.editComponentType = 'text';
        }
        
        if ('children' in newCol && newCol.children) {
          newCol.children = processCols(newCol.children);
        } else {
          // 保存原始render函数
          const originalRender = newCol.render;
          
          // 创建新的render函数，支持编辑
          newCol.render = (text: any, record: TaxForm, index: number) => {
            // 调试信息
            if (index === 0 && !text && newCol.dataIndex) {
              console.log(`渲染字段 ${String(newCol.dataIndex)}, 编辑状态: ${isEditing}, 可编辑: ${newCol.editableBy}`);
            }
            
            // 如果不在编辑模式，使用原始render
            if (!isEditing || !editedData) {
              return originalRender ? originalRender(text, record, index) : text;
            }
            
            // 如果没有dataIndex，不能编辑
            if (!newCol.dataIndex) {
              return originalRender ? originalRender(text, record, index) : text;
            }
            
            // 简化检查：所有字段都可编辑(测试阶段)
            const canEdit = true;
                
            if (!canEdit) {
              return originalRender ? originalRender(text, record, index) : text;
            }
            
            // 找到当前记录在editedData中的位置
            const currentRecord = editedData.find(item => item.id === record.id);
            if (!currentRecord) return text;
            
            // 获取字段路径，支持嵌套字段如 ['tax_info', 'outstanding_tax']
            const fieldPath = Array.isArray(newCol.dataIndex) 
              ? (newCol.dataIndex as (string | number)[])
              : newCol.dataIndex ? [newCol.dataIndex as string] : [];
              
            if (fieldPath.length === 0) return text;
            
            // 获取当前编辑值
            const currentValue = getNestedValue(currentRecord, fieldPath);
            
            // 处理值变更
            const handleValueChange = (value: any) => {
              setEditedData(prev => {
                if (!prev) return null;
                return prev.map(item => {
                  if (item.id === record.id) {
                    return setNestedValue(item, fieldPath, value);
                  }
                  return item;
                });
              });
            };
            
            // 简化: 只使用文本输入框
            return (
              <Input 
                value={currentValue} 
                onChange={e => handleValueChange(e.target.value)}
                style={{ width: '100%' }}
              />
            );
          };

          // 保留原有的列宽调整逻辑
          if (typeof newCol.width === 'number' && newCol.key) {
            newCol.onHeaderCell = (currentColumn: ColumnType<TaxForm>) => ({
              width: currentColumn.width,
              onColumnResize: (_e: React.SyntheticEvent, { size }: { size: { width: number } }) => {
                setTableColumns((prevColumns) => {
                  const updateWidthRecursively = (
                    columnsToUpdate: ColumnsType<TaxForm>,
                    targetKey: React.Key,
                    newWidth: number
                  ): ColumnsType<TaxForm> => {
                    return columnsToUpdate.map((mapCol: ProcessableColumnType<TaxForm>) => {
                      const columnCopy = { ...mapCol };
                      if (columnCopy.key === targetKey) {
                        return { ...columnCopy, width: newWidth };
                      }
                      if ('children' in columnCopy && columnCopy.children) {
                        columnCopy.children = updateWidthRecursively(columnCopy.children, targetKey, newWidth);
                      }
                      return columnCopy;
                    });
                  };
                  if (currentColumn.key === null || currentColumn.key === undefined) {
                    console.error("Resizable column is missing a key.", currentColumn);
                    return prevColumns; 
                  }
                  return updateWidthRecursively(prevColumns, currentColumn.key, size.width);
                });
              },
            } as any);
          }
        }
        return newCol;
      });
    };
    return processCols(initialColumnsConfig);
  });

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

  if (error) {
    return <div className="page-container error-message">错误: {error}</div>;
  }

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <div className="logo-title">
            <Title level={3} style={{ color: 'white', margin: 0 }}>税务管理系统</Title>
          </div>
          <div className="user-actions">
            <Space>
              <Avatar icon={<UserOutlined />} />
              <Text style={{ color: 'white' }}>{username || '未登录用户'}</Text>
              <Text type="secondary" style={{ color: '#ccc' }}>({userType === 'admin' ? '管理员' : '普通用户'})</Text>
              <Divider type="vertical" style={{ backgroundColor: '#555', height: '20px' }} />
              <Button 
                type="text" 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                style={{ color: 'white' }}
              >
                退出
              </Button>
            </Space>
          </div>
        </div>
      </Header>

      <Content className="main-content">
        <div className="page-container">
          <div className="page-header">
            <Title level={2}>税务管理总览</Title>
            <div className="table-actions">
              {isEditing ? (
                <Space>
                  <Button 
                    type="primary" 
                    onClick={handleSaveChanges} 
                    disabled={loading}
                    icon={<SaveOutlined />}
                  >
                    保存
                  </Button>
                  <Button 
                    onClick={handleCancelEditing} 
                    disabled={loading}
                    icon={<CloseOutlined />}
                  >
                    取消
                  </Button>
                </Space>
              ) : (
                <Button 
                  type="primary" 
                  onClick={handleStartEditing} 
                  disabled={loading}
                  icon={<EditOutlined />}
                >
                  编辑
                </Button>
              )}
            </div>
          </div>

          <Table
            columns={tableColumns}
            dataSource={isEditing ? (editedData || []) : data}
            loading={loading}
            rowKey="id"
            bordered
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`,
            }}
            size="middle"
            components={{
              header: {
                cell: ResizableTitle,
              },
            }}
          />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        税务管理系统 ©{new Date().getFullYear()} 版权所有
      </Footer>
    </Layout>
  );
};

export default Main;