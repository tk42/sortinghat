'use client';

import React, { useState } from 'react';
import { FileProcessingJob } from '@/src/lib/interfaces';

interface FileConversionDiffProps {
  job: FileProcessingJob;
  onConfirm: (jobId: number) => void;
  onReject: (jobId: number) => void;
  onModify: (jobId: number, modifications: any) => void;
}

interface DiffChange {
  type: 'added' | 'removed' | 'modified';
  field: string;
  old_value?: any;
  new_value?: any;
  row_index?: number;
}

const FileConversionDiff: React.FC<FileConversionDiffProps> = ({
  job,
  onConfirm,
  onReject,
  onModify
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'preview' | 'original'>('diff');
  const [modifications, setModifications] = useState<Record<string, any>>({});

  if (!job.result_data.conversion_diff) {
    return null;
  }

  const { original, converted, changes } = job.result_data.conversion_diff;

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'removed':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 12H6" />
            </svg>
          </div>
        );
      case 'modified':
        return (
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'removed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'modified':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleFieldModification = (field: string, newValue: any) => {
    setModifications(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const renderDataTable = (data: any[], title: string, isEditable: boolean = false) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>データがありません</p>
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 5).map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {headers.map((header) => (
                    <td key={header} className="px-3 py-2 text-sm text-gray-900">
                      {isEditable ? (
                        <input
                          type="text"
                          value={modifications[`${index}.${header}`] ?? row[header]}
                          onChange={(e) => handleFieldModification(`${index}.${header}`, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span>{String(row[header] || '')}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 5 && (
            <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 text-center">
              他 {data.length - 5} 行... (最初の5行のみ表示)
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChangesTab = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">変換内容 ({changes.length}件の変更)</h4>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            {getChangeIcon('added')}
            <span>追加</span>
          </div>
          <div className="flex items-center space-x-1">
            {getChangeIcon('modified')}
            <span>変更</span>
          </div>
          <div className="flex items-center space-x-1">
            {getChangeIcon('removed')}
            <span>削除</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {changes.map((change: DiffChange, index) => (
          <div
            key={index}
            className={`p-3 rounded-md border ${getChangeColor(change.type)}`}
          >
            <div className="flex items-start space-x-2">
              {getChangeIcon(change.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{change.field}</span>
                  {change.row_index !== undefined && (
                    <span className="text-xs opacity-75">行 {change.row_index + 1}</span>
                  )}
                </div>
                
                {change.type === 'modified' && (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs">
                      <span className="text-red-600">- {String(change.old_value)}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-green-600">+ {String(change.new_value)}</span>
                    </div>
                  </div>
                )}
                
                {change.type === 'added' && (
                  <div className="mt-1 text-xs text-green-600">
                    + {String(change.new_value)}
                  </div>
                )}
                
                {change.type === 'removed' && (
                  <div className="mt-1 text-xs text-red-600">
                    - {String(change.old_value)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          ファイル変換結果の確認
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{job.original_name}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'diff', label: '変更内容', count: changes.length },
            { key: 'preview', label: '変換後', count: converted.length },
            { key: 'original', label: '元データ', count: original.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'diff' && renderChangesTab()}
        {activeTab === 'preview' && renderDataTable(converted, '変換後のデータ', true)}
        {activeTab === 'original' && renderDataTable(original, '元のデータ')}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          この変換内容で処理を続行しますか？
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onReject(job.id)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            やり直し
          </button>
          
          {Object.keys(modifications).length > 0 && (
            <button
              onClick={() => onModify(job.id, modifications)}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              修正を適用
            </button>
          )}
          
          <button
            onClick={() => onConfirm(job.id)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            この内容で続行
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileConversionDiff;