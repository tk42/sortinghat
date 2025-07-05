import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

export interface Column<T> {
  key: keyof T | string
  header: string
  accessor?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  loading?: boolean
  emptyMessage?: string
  className?: string
  onRowClick?: (item: T) => void
  selectedRows?: Set<T[keyof T]>
  onSelectionChange?: (selected: Set<T[keyof T]>) => void
  sortConfig?: {
    key: keyof T | string
    direction: 'asc' | 'desc'
  }
  onSort?: (key: keyof T | string) => void
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  loading = false,
  emptyMessage = 'データがありません',
  className,
  onRowClick,
  selectedRows,
  onSelectionChange,
  sortConfig,
  onSort,
}: DataTableProps<T>) {
  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item)
    }
  }

  const handleSelectRow = (item: T, checked: boolean) => {
    if (!onSelectionChange || !selectedRows) return
    
    const newSelected = new Set(selectedRows)
    const key = item[keyField]
    
    if (checked) {
      newSelected.add(key)
    } else {
      newSelected.delete(key)
    }
    
    onSelectionChange(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      const allKeys = new Set(data.map(item => item[keyField]))
      onSelectionChange(allKeys)
    } else {
      onSelectionChange(new Set())
    }
  }

  const renderCellContent = (item: T, column: Column<T>) => {
    if (column.accessor) {
      return column.accessor(item)
    }
    
    if (typeof column.key === 'string' && column.key.includes('.')) {
      // Handle nested properties (e.g., 'user.name')
      const keys = column.key.split('.')
      let value: any = item
      for (const key of keys) {
        value = value?.[key]
      }
      return value
    }
    
    return item[column.key as keyof T] as React.ReactNode
  }

  const getSortIcon = (columnKey: keyof T | string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    
    return (
      <svg 
        className={`w-4 h-4 ml-1 ${sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-blue-600 rotate-180'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectedRows && onSelectionChange && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedRows.size === data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={`${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                style={{ width: column.width }}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectedRows ? 1 : 0)} 
                className="text-center py-8 text-gray-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const key = item[keyField]
              const isSelected = selectedRows?.has(key) || false
              
              return (
                <TableRow
                  key={String(key)}
                  className={`${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => handleRowClick(item)}
                >
                  {selectedRows && onSelectionChange && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectRow(item, e.target.checked)
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={column.className}
                    >
                      {renderCellContent(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable