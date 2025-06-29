'use client';

import React from 'react';
import { OptimizationJob } from '@/src/lib/interfaces';

interface OptimizationProgressProps {
  job: OptimizationJob;
}

const OptimizationProgress: React.FC<OptimizationProgressProps> = ({ job }) => {
  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'running':
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
      case 'running':
        return (
          <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return '待機中';
      case 'running':
        return '最適化実行中';
      case 'completed':
        return '最適化完了';
      case 'failed':
        return '最適化失敗';
      default:
        return '不明';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getComputationTime = () => {
    if (job.completed_at && job.started_at) {
      const start = new Date(job.started_at).getTime();
      const end = new Date(job.completed_at).getTime();
      const duration = (end - start) / 1000;
      return `${duration.toFixed(1)}秒`;
    }
    return '-';
  };

  return (
    <div className={`rounded-lg border p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">班分け最適化</span>
        </div>
        <span className="text-xs">{getStatusText()}</span>
      </div>
      
      {/* Progress Bar */}
      {job.status === 'running' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>最適化計算中...</span>
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
      
      {/* Constraint Summary */}
      <div className="mb-2 p-2 bg-white bg-opacity-50 rounded text-xs">
        <div className="font-medium mb-1">制約条件:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>チーム数: {job.constraints_data.max_num_teams || '-'}</div>
          <div>人数/チーム: {job.constraints_data.members_per_team || '-'}</div>
          <div>男女ペア: {job.constraints_data.at_least_one_pair_sex ? '必須' : '任意'}</div>
          <div>リーダー: {job.constraints_data.at_least_one_leader ? '必須' : '任意'}</div>
        </div>
      </div>
      
      {/* Error Message */}
      {job.status === 'failed' && job.error_message && (
        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
          <strong>エラー詳細:</strong> {job.error_message}
        </div>
      )}
      
      {/* Results Summary */}
      {job.status === 'completed' && job.result_data.teams && (
        <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded">
          <div className="text-xs font-medium text-green-800 mb-1">最適化結果:</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div>
              <span className="font-medium">チーム数:</span> {job.result_data.teams.length}
            </div>
            <div>
              <span className="font-medium">計算時間:</span> {getComputationTime()}
            </div>
            {job.result_data.objective_value && (
              <div>
                <span className="font-medium">目的関数値:</span> {job.result_data.objective_value.toFixed(2)}
              </div>
            )}
            {job.result_data.feasibility_score && (
              <div>
                <span className="font-medium">実行可能性:</span> {(job.result_data.feasibility_score * 100).toFixed(1)}%
              </div>
            )}
          </div>
          
          {job.result_data.optimization_status && (
            <div className="mt-1 text-xs text-green-600">
              ステータス: {job.result_data.optimization_status}
            </div>
          )}
        </div>
      )}
      
      {/* Timing Information */}
      <div className="mt-2 flex justify-between text-xs opacity-75">
        <span>開始: {formatDateTime(job.started_at)}</span>
        {job.completed_at && (
          <span>完了: {formatDateTime(job.completed_at)}</span>
        )}
      </div>
    </div>
  );
};

export default OptimizationProgress;