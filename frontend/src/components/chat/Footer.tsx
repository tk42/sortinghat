'use client';

import React from 'react';
import { ConversationStep } from '@/src/lib/interfaces';

interface FooterProps {
  currentStep: ConversationStep;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  showInfo?: boolean;
  infoText?: string;
}

const Footer: React.FC<FooterProps> = ({
  currentStep,
  onBack,
  onNext,
  isLoading = false,
  nextDisabled = false,
  nextLabel,
  showInfo = false,
  infoText
}) => {
  const getDefaultNextLabel = (step: ConversationStep): string => {
    switch (step) {
      case 'initial':
        return '次へ';
      case 'class_setup':
        return '次へ（アンケート作成）';
      case 'survey_creation':
        return '次へ（制約設定）';
      case 'constraint_setting':
        return '次へ（最適化実行）';
      case 'optimization_execution':
        return '次へ（結果確認）';
      case 'result_confirmation':
        return '完了';
      default:
        return '次へ';
    }
  };

  const shouldShowBackButton = currentStep !== 'initial';
  const shouldShowNextButton = currentStep !== 'result_confirmation';

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Back Button */}
        <div>
          {shouldShowBackButton ? (
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              戻る
            </button>
          ) : (
            <div></div>
          )}
        </div>

        {/* Info Text (Center) */}
        <div className="flex-1 text-center">
          {showInfo && infoText && (
            <p className="text-sm text-gray-600">{infoText}</p>
          )}
        </div>

        {/* Next Button */}
        <div>
          {shouldShowNextButton ? (
            <button
              onClick={onNext}
              disabled={nextDisabled || isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {nextLabel || getDefaultNextLabel(currentStep)}
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;