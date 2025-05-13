import { ColumnType, ColumnGroupType } from 'antd/es/table';

// 扩展列类型，添加编辑相关属性
export interface EditableColumnType<T> extends ColumnType<T> {
  editableBy?: 'admin' | 'user' | 'both';  // 谁可以编辑此字段
  editComponentType?: 'text' | 'number' | 'select' | 'date' | 'textarea';  // 编辑组件类型
  options?: { label: string; value: any }[];  // 下拉选项（用于select类型）
}

export interface ResizableTitleProps extends React.HTMLAttributes<HTMLElement> {
  onColumnResize: (e: React.SyntheticEvent, data: { size: { width: number } }) => void;
  width?: number;
}

export type ProcessableColumnType<T> = (ColumnGroupType<T> | ColumnType<T>);