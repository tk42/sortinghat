'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/src/utils/firebase/authprovider';

interface TooltipStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FirstLoginTooltipsProps {
  onComplete?: () => void;
}

const FirstLoginTooltips: React.FC<FirstLoginTooltipsProps> = ({ onComplete }) => {
  const { state } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const tooltipSteps: TooltipStep[] = [
    {
      id: 'welcome',
      target: '',
      title: 'ようこそ！',
      content: 'Synergy Match Makerへようこそ！班分け最適化を始めましょう。',
      position: 'bottom'
    },
    {
      id: 'ai-assistant',
      target: '[data-tooltip="ai-assistant"]',
      title: 'AIアシスタント',
      content: 'こちらをクリックすると、AIアシスタントが班分けをお手伝いします。ファイルアップロードから最適化まで、対話形式で進められます。',
      position: 'left',
      action: {
        label: 'AIアシスタントを開く',
        onClick: () => {
          const element = document.querySelector('[data-tooltip="ai-assistant"]') as HTMLElement;
          element?.click();
        }
      }
    },
    {
      id: 'class-management',
      target: '[data-tooltip="class-management"]',
      title: 'クラス管理',
      content: '担任クラスの情報や学生データを管理できます。',
      position: 'left'
    },
    {
      id: 'survey-results',
      target: '[data-tooltip="survey-results"]',
      title: '過去の結果',
      content: 'これまでのアンケート結果や班分け履歴を確認・検索できます。',
      position: 'left'
    },
    {
      id: 'account-menu',
      target: '[data-tooltip="account-menu"]',
      title: 'アカウント設定',
      content: 'アカウント設定や履歴の確認はこちらから。ログアウトもここでできます。',
      position: 'top'
    }
  ];

  useEffect(() => {
    // Check if this is the user's first login
    const checkFirstLogin = async () => {
      if (!state.teacher) return;

      const hasSeenTooltips = localStorage.getItem(`tooltips-seen-${state.teacher.id}`);
      if (!hasSeenTooltips) {
        setIsVisible(true);
      }
    };

    checkFirstLogin();
  }, [state.teacher]);

  useEffect(() => {
    if (!isVisible || currentStep >= tooltipSteps.length) return;

    const step = tooltipSteps[currentStep];
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = rect.top - 10;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 10;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
            break;
        }

        setTooltipPosition({ top, left });

        // Highlight the target element
        targetElement.classList.add('tooltip-highlight');
        return () => targetElement.classList.remove('tooltip-highlight');
      }
    } else {
      // Center tooltip for welcome step
      setTooltipPosition({ 
        top: window.innerHeight / 2, 
        left: window.innerWidth / 2 
      });
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < tooltipSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (state.teacher) {
      localStorage.setItem(`tooltips-seen-${state.teacher.id}`, 'true');
    }
    setIsVisible(false);
    onComplete?.();
  };

  const currentTooltip = tooltipSteps[currentStep];

  if (!isVisible || !currentTooltip) {
    return null;
  }

  const getTooltipClasses = () => {
    const base = 'fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm';
    const position = currentTooltip.position;
    
    switch (position) {
      case 'top':
        return `${base} transform -translate-x-1/2 -translate-y-full`;
      case 'bottom':
        return `${base} transform -translate-x-1/2`;
      case 'left':
        return `${base} transform -translate-x-full -translate-y-1/2`;
      case 'right':
        return `${base} transform -translate-y-1/2`;
      default:
        return `${base} transform -translate-x-1/2 -translate-y-1/2`;
    }
  };

  const getArrowClasses = () => {
    const base = 'absolute w-3 h-3 bg-white border';
    const position = currentTooltip.position;
    
    switch (position) {
      case 'top':
        return `${base} border-l-0 border-t-0 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${base} border-r-0 border-b-0 transform rotate-45 -top-1.5 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${base} border-l-0 border-b-0 transform rotate-45 -right-1.5 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${base} border-r-0 border-t-0 transform rotate-45 -left-1.5 top-1/2 -translate-y-1/2`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" />
      
      {/* Tooltip */}
      <div
        className={getTooltipClasses()}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Arrow */}
        {currentTooltip.target && <div className={getArrowClasses()} />}
        
        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {currentTooltip.title}
            </h3>
            <p className="text-sm text-gray-600">
              {currentTooltip.content}
            </p>
          </div>

          {/* Action Button */}
          {currentTooltip.action && (
            <button
              onClick={currentTooltip.action.onClick}
              className="w-full bg-blue-50 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              {currentTooltip.action.label}
            </button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {tooltipSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                スキップ
              </button>
              
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors px-2 py-1"
                >
                  戻る
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
              >
                {currentStep === tooltipSteps.length - 1 ? '完了' : '次へ'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global styles for highlighted elements */}
      <style jsx global>{`
        .tooltip-highlight {
          position: relative;
          z-index: 9999;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          border-radius: 0.375rem;
          animation: tooltip-pulse 2s infinite;
        }
        
        @keyframes tooltip-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
          }
        }
      `}</style>
    </>
  );
};

export default FirstLoginTooltips;