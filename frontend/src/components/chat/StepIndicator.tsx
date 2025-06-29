'use client';

import React from 'react';
import { ConversationStep } from '@/src/lib/interfaces';

interface StepIndicatorProps {
  currentStep: ConversationStep;
  completedSteps: ConversationStep[];
}

const steps: Array<{
  key: ConversationStep;
  label: string;
  icon: React.ReactNode;
  additionalPaths?: React.ReactNode[];
}> = [
  {
    key: 'initial',
    label: '開始',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  },
  {
    key: 'class_setup',
    label: 'クラス設定',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  },
  {
    key: 'survey_creation',
    label: 'アンケート作成',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  },
  {
    key: 'constraint_setting',
    label: '制約設定',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    additionalPaths: [<path key="gear" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />]
  },
  {
    key: 'optimization_execution',
    label: '最適化実行',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  },
  {
    key: 'result_confirmation',
    label: '結果確認',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  }
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, completedSteps }) => {
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  
  const getStepStatus = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (completedSteps.includes(step.key)) {
      return 'completed';
    } else if (stepIndex === currentStepIndex) {
      return 'current';
    } else if (stepIndex < currentStepIndex) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 text-white',
          line: 'bg-green-500',
          text: 'text-green-600 font-medium'
        };
      case 'current':
        return {
          circle: 'bg-blue-500 text-white ring-4 ring-blue-100',
          line: 'bg-gray-300',
          text: 'text-blue-600 font-semibold'
        };
      default:
        return {
          circle: 'bg-gray-200 text-gray-500',
          line: 'bg-gray-300',
          text: 'text-gray-500'
        };
    }
  };

  return (
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const styles = getStepStyles(status);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${styles.circle}`}>
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {step.icon}
                      {step.additionalPaths?.map((path, i) => React.cloneElement(path, { key: i }))}
                    </svg>
                  )}
                </div>
              </div>

              {/* Step Label */}
              <div className="ml-2 flex-1">
                <div className={`text-xs transition-colors duration-200 ${styles.text}`}>
                  {step.label}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 ml-2">
                  <div className={`h-0.5 transition-colors duration-200 ${styles.line}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress Text */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-600">
          ステップ {currentStepIndex + 1} / {steps.length}：
          {steps[currentStepIndex]?.label}
        </span>
      </div>
    </div>
  );
};

export default StepIndicator;