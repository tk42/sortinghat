'use client';

import React from 'react';
import { ConversationStep } from '@/src/lib/interfaces';

interface NavigatorProps {
  currentStep: ConversationStep;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextTooltip?: string;
  showInfo?: boolean;
  infoText?: string;
  teamsCount?: number;
  studentsCount?: number;
  onSaveResults?: () => void;
  /**
   * If true, back button is shown even when currentStep is 'initial'.
   */
  showBackOverride?: boolean;
}

const Navigator: React.FC<NavigatorProps> = ({
  currentStep,
  onBack,
  onNext,
  isLoading = false,
  nextDisabled = false,
  nextLabel,
  nextTooltip,
  showInfo = false,
  infoText,
  teamsCount,
  studentsCount,
  onSaveResults,
  showBackOverride = false
}) => {
  const shouldShowBackButton = currentStep !== 'initial' || showBackOverride;
  const shouldShowNextButton = currentStep !== 'result_confirmation';

  const renderRightArea = () => {
    if (currentStep === 'result_confirmation') {
      return (
        <div className="flex gap-3">
          <button
            onClick={onSaveResults}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            結果を保存
          </button>
        </div>
      );
    }
    if (shouldShowNextButton) {
      return (
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          title={nextDisabled ? nextTooltip : undefined}
        >
          {nextLabel || '次へ'}
        </button>
      );
    }
    return <div></div>;
  };

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Back Button */}
        <div>
          {shouldShowBackButton ? (
            <button
              onClick={onBack}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
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
          {currentStep === 'result_confirmation' && teamsCount !== undefined && studentsCount !== undefined ? (
            <p className="text-sm text-gray-600">チーム編成結果: {teamsCount}チーム、計{studentsCount}名</p>
          ) : (
            showInfo && infoText && <p className="text-sm text-gray-600">{infoText}</p>
          )}
        </div>

        {/* Right Area (Next or Actions) */}
        <div>
          {renderRightArea()}
        </div>
      </div>
    </div>
  );
};

export default Navigator;