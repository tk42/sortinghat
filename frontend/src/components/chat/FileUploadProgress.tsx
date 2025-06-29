'use client';

import React from 'react';
import { FileProcessingJob } from '@/src/lib/interfaces';

interface FileUploadProgressProps {
  job: FileProcessingJob;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({ job }) => {
  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return '待機中';
      case 'processing':
        return '処理中';
      case 'completed':
        return '完了';
      case 'failed':
        return 'エラー';
      default:
        return '不明';
    }
  };

  const getProcessingTypeText = () => {
    switch (job.processing_type) {
      case 'csv_import':
        return 'CSVインポート';
      case 'llm_conversion':
        return 'LLM変換';
      case 'validation':
        return 'データ検証';
      default:
        return job.processing_type;
    }
  };

  return (
    <div className={`rounded-lg border p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">{job.original_name}</span>
        </div>
        <span className="text-xs">{getStatusText()}</span>
      </div>
      
      <div className="text-xs mb-2">
        {getProcessingTypeText()} • {Math.round(job.file_size / 1024)}KB
      </div>
      
      {/* Progress Bar */}
      {job.status === 'processing' && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>処理進行中...</span>
            <span>{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {job.status === 'failed' && job.error_message && (
        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
          <strong>エラー詳細:</strong> {job.error_message}
        </div>
      )}
      
      {/* Validation Errors */}
      {job.result_data.validation_errors && job.result_data.validation_errors.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded">
          <div className="text-xs font-medium text-yellow-800 mb-1">検証エラー:</div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {job.result_data.validation_errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Conversion Diff Preview */}
      {job.result_data.conversion_diff && (
        <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded">
          <div className="text-xs font-medium text-blue-800 mb-1">
            変換結果プレビュー ({job.result_data.conversion_diff.changes.length}件の変更)
          </div>
          <div className="max-h-20 overflow-y-auto">
            {job.result_data.conversion_diff.changes.slice(0, 3).map((change, index) => (
              <div key={index} className="text-xs text-blue-700">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  change.type === 'added' ? 'bg-green-400' :
                  change.type === 'removed' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                {change.field}: {change.old_value} → {change.new_value}
              </div>
            ))}
            {job.result_data.conversion_diff.changes.length > 3 && (
              <div className="text-xs text-blue-600 italic">
                他 {job.result_data.conversion_diff.changes.length - 3} 件...
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Success Summary */}
      {job.status === 'completed' && job.result_data.preview && (
        <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
          {job.result_data.preview.length} 件のデータを正常に処理しました
        </div>
      )}
    </div>
  );
};

export default FileUploadProgress;