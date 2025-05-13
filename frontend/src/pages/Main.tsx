import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { taxForms as taxFormsApi } from '../services/api';
import { TaxForm } from '../types/taxTypes';
import './Main.css';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { Input, InputNumber, DatePicker, Select, Button, message } from 'antd';
import moment from 'moment';
import { useAuth } from '../App';
import { getInitialColumnsConfig } from '../config/columnsConfig';
import { ProcessableColumnType, EditableColumnType, ResizableTitleProps } from '../types/tableTypes';

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
  
  // 获取当前用户信息
  const currentUser = { userType: 'admin' }; // 假设当前用户是管理员
  
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
        
        if ('children' in newCol && newCol.children) {
          newCol.children = processCols(newCol.children);
        } else {
          // 保存原始render函数
          const originalRender = newCol.render;
          
          // 创建新的render函数，支持编辑
          newCol.render = (text: any, record: TaxForm, index: number) => {
            // 如果不在编辑模式，使用原始render
            if (!isEditing || !editedData) {
              return originalRender ? originalRender(text, record, index) : text;
            }
            
            // 检查当前用户是否有权限编辑此字段
            const canEdit = 
              newCol.editableBy === 'both' || 
              (newCol.editableBy === 'admin' && currentUser.userType === 'admin') ||
              (newCol.editableBy === 'user' && (currentUser.userType === 'user' || currentUser.userType === 'admin'));
              
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
            
            // 根据编辑组件类型渲染不同的输入控件
            switch(newCol.editComponentType) {
              case 'text':
                return (
                  <Input 
                    value={currentValue} 
                    onChange={e => handleValueChange(e.target.value)} 
                  />
                );
              case 'number':
                return (
                  <InputNumber 
                    value={currentValue} 
                    onChange={value => handleValueChange(value)} 
                  />
                );
              case 'textarea':
                return (
                  <Input.TextArea 
                    value={currentValue} 
                    onChange={e => handleValueChange(e.target.value)}
                    autoSize={{ minRows: 2, maxRows: 5 }}
                  />
                );
              case 'select':
                return (
                  <Select 
                    value={currentValue} 
                    onChange={value => handleValueChange(value)}
                    options={newCol.options}
                    style={{ width: '100%' }}
                  />
                );
              case 'date':
                return (
                  <DatePicker 
                    value={currentValue ? moment(currentValue) : null}
                    onChange={(date, dateString) => handleValueChange(dateString)} 
                  />
                );
              default:
                return originalRender ? originalRender(text, record, index) : text;
            }
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
    <div className="page-container">
      <div className="table-actions">
        {isEditing ? (
          <>
            <Button type="primary" onClick={handleSaveChanges} disabled={loading}>
              保存
            </Button>
            <Button onClick={handleCancelEditing} disabled={loading}>
              取消
            </Button>
          </>
        ) : (
          <Button type="primary" onClick={handleStartEditing} disabled={loading}>
            编辑
          </Button>
        )}
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
        title={() => <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>税务管理总览</h1>}
        // sticky
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

export default Main;