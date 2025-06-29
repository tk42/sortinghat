'use client';

import React, { useState, useEffect } from 'react';
import { Class, Survey, OptimizationJob } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';

interface OptimizationExecutionPhaseProps {
  selectedClass: Class | null;
  selectedSurvey: Survey | null;
  onNext: () => void;
  optimizationJob: OptimizationJob | null;
}

const OptimizationExecutionPhase: React.FC<OptimizationExecutionPhaseProps> = ({
  selectedClass,
  selectedSurvey,
  onNext,
  optimizationJob
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const toastHelpers = useToastHelpers();

  useEffect(() => {
    if (optimizationJob) {
      setProgress(optimizationJob.progress);
      setIsExecuting(optimizationJob.status === 'running');
      
      if (optimizationJob.status === 'completed') {
        toastHelpers.success('最適化完了', '班分け最適化が完了しました');
      } else if (optimizationJob.status === 'failed') {
        toastHelpers.error('最適化失敗', optimizationJob.error_message || '最適化に失敗しました');
      }
    }
  }, [optimizationJob, toastHelpers]);

  const handleStartOptimization = async () => {
    if (!selectedClass || !selectedSurvey) {
      toastHelpers.error('エラー', 'クラスまたはアンケートが選択されていません');
      return;
    }

    setIsExecuting(true);
    setProgress(0);
    setExecutionLogs(['最適化を開始しています...']);
    
    try {
      // Simulate optimization steps
      const steps = [
        { message: 'データを準備中...', progress: 10 },
        { message: '制約条件を解析中...', progress: 25 },
        { message: '数理最適化を実行中...', progress: 50 },
        { message: '解の妥当性を検証中...', progress: 75 },
        { message: '結果を生成中...', progress: 90 },
        { message: '最適化完了!', progress: 100 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentStep(step.message);
        setProgress(step.progress);
        setExecutionLogs(prev => [...prev, step.message]);
      }

      // TODO: Call actual optimization API
      // const response = await fetch('/api/optimization/execute', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     class_id: selectedClass.id,
      //     survey_id: selectedSurvey.id,
      //     constraints: constraintData
      //   })
      // });

      toastHelpers.success('最適化完了', '班分け最適化が完了しました');
      
      // Auto-advance to results
      setTimeout(() => {
        onNext();
      }, 2000);

    } catch (error) {
      console.error('Optimization error:', error);
      toastHelpers.error('最適化エラー', '最適化の実行中にエラーが発生しました');
      setExecutionLogs(prev => [...prev, `エラー: ${error}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!selectedClass || !selectedSurvey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">クラスまたはアンケートが選択されていません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">最適化実行</h2>
        <p className="text-gray-600">
          設定された制約条件に基づいて班分けを最適化します
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Execution Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">実行情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">クラス:</span>
                <span className="ml-2 font-medium">{selectedClass.name}</span>
              </div>
              <div>
                <span className="text-gray-500">アンケート:</span>
                <span className="ml-2 font-medium">{selectedSurvey.name}</span>
              </div>
              <div>
                <span className="text-gray-500">最適化アルゴリズム:</span>
                <span className="ml-2 font-medium">線形計画法（PuLP）</span>
              </div>
              <div>
                <span className="text-gray-500">目的関数:</span>
                <span className="ml-2 font-medium">スコア差最小化</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">実行状況</h3>
              <span className="text-sm font-medium text-gray-500">
                {progress}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {currentStep && (
              <p className="text-sm text-gray-600">{currentStep}</p>
            )}
          </div>

          {/* Execution Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">実行ログ</h3>
            <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto">
              {executionLogs.length > 0 ? (
                <div className="space-y-1">
                  {executionLogs.map((log, index) => (
                    <div key={index} className="text-sm text-gray-700 font-mono">
                      <span className="text-gray-500">
                        [{new Date().toLocaleTimeString()}]
                      </span>{' '}
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">まだ実行されていません</p>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="text-center">
            {!isExecuting && progress === 0 && (
              <button
                onClick={handleStartOptimization}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors text-lg font-medium"
              >
                最適化を実行
              </button>
            )}
            
            {isExecuting && (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <span className="text-gray-600">最適化実行中...</span>
              </div>
            )}
            
            {progress === 100 && !isExecuting && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">最適化が完了しました</span>
                </div>
                <button
                  onClick={onNext}
                  className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
                >
                  結果を確認
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationExecutionPhase;