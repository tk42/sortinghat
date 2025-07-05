'use client'

import React, { useRef, useState } from 'react'
import { useChatContext } from '@/src/contexts/ChatContext'
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications'
import DashboardHeader from '@/src/components/Common/DashboardHeader'
import { useMounted } from '@/src/utils/hooks'
import ChatInput from './ChatInput'
import StepIndicator from './StepIndicator'
import OptimizationProgress from './OptimizationProgress'
import Navigator from './Navigator'
import PhaseRenderer from './PhaseRenderer'

// Custom hooks
import { useChatLogic } from '@/src/hooks/chat/useChatLogic'

// Type for internal back handler ref
export type BackHandler = () => boolean

const ChatWindow: React.FC = () => {
  const mounted = useMounted()
  const { state, clearError } = useChatContext()
  const toastHelpers = useToastHelpers()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // フェーズコンポーネント内で戻るを捕捉するための参照
  const internalBackRef = useRef<BackHandler>()
  // 「戻る」表示制御用ステート
  const [internalBackActive, setInternalBackActive] = useState(false)
  
  // Use the main chat logic hook
  const {
    // Chat state
    chatState,
    inputValue,
    setInputValue,
    
    // Session state
    selectedClass,
    selectedSurvey,
    studentPreferences,
    optimizationResult,
    surveySetupComplete,
    updateSelectedClass,
    updateSelectedSurvey,
    updateSurveySetupComplete,
    updateOptimizationResult,
    
    // Navigation
    currentStep,
    canMoveNext,
    canMoveBack,
    getStepLabel,
    getInfoText,
    getNextTooltip,
    handleNextPhase,
    handleBackPhase,
    
    // Result handling
    teamsCount,
    studentsCount,
    handleSaveResults,
    hasResults,
    
    // Chat actions
    handleSendMessage,
    handleChatReset,
    
    // Utilities
    formatDateTime,
    
    // UI state helpers
    shouldShowChatInterface,
    shouldShowNavigator,
  } = useChatLogic()

  // Wrap back handler to allow phase-local interception
  const handleBack = async () => {
    // If current phase handled the back action internally, skip global navigation
    if (internalBackRef.current && internalBackRef.current()) {
      return
    }
    await handleBackPhase()
  }

  return (
    <div className="min-h-screen flex">
      {/* Side margins for future expansion */}
      <div className="hidden lg:block flex-1 max-w-xs" />
      
      {/* Main chat area */}
      <div className="w-full max-w-[80%] mx-auto flex flex-col bg-white shadow-lg">
        {/* Header */}
        <DashboardHeader subtitle={state.conversation ? formatDateTime(state.conversation.created_at) : 'AIがお手伝いします'} />
        
        {/* Step Indicator */}
        <div className="border-b border-gray-200">
          <StepIndicator 
            currentStep={currentStep}
            completedSteps={[]} // TODO: Track completed steps
          />
        </div>

        {/* Navigator - positioned right after Step Indicator */}
        {shouldShowNavigator && (
          <Navigator
            currentStep={currentStep}
            onBack={handleBack}
            onNext={handleNextPhase}
            showBackOverride={internalBackActive}
            isLoading={state.isLoading}
            nextDisabled={!canMoveNext}
            nextTooltip={getNextTooltip()}
            showInfo={true}
            infoText={getInfoText()}
            teamsCount={currentStep === 'result_confirmation' ? teamsCount : undefined}
            studentsCount={currentStep === 'result_confirmation' ? studentsCount : undefined}
            onSaveResults={currentStep === 'result_confirmation' ? handleSaveResults : undefined}
          />
        )}

        {/* Phase Content Area */}
        <div className="flex-1 overflow-y-auto">
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mt-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{state.error}</p>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <PhaseRenderer
            currentStep={currentStep}
            selectedClass={selectedClass}
            selectedSurvey={selectedSurvey}
            studentPreferences={studentPreferences}
            optimizationResult={optimizationResult}
            messages={state.messages}
            inputValue={inputValue}
            isLoading={state.isLoading}
            isTyping={state.isTyping}
            messagesEndRef={messagesEndRef}
            onClassSelect={updateSelectedClass}
            onSurveySelect={updateSelectedSurvey}
            onSurveySetupComplete={updateSurveySetupComplete}
            onOptimizationComplete={updateOptimizationResult}
            onSendMessage={handleSendMessage}
            onInputChange={setInputValue}
            internalBackRef={internalBackRef}
            setInternalBackActive={setInternalBackActive}
          />
        </div>

        {/* Optimization Progress */}
        {state.optimizationJob && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <OptimizationProgress job={state.optimizationJob} />
          </div>
        )}

        {/* Chat Input - Only shown in constraint setting phase */}
        {shouldShowChatInterface && (
          <div className="border-t border-gray-200 px-6 py-4 bg-white">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSendMessage={handleSendMessage}
              disabled={state.isLoading}
              placeholder="制約条件を自然言語で入力してください..."
            />
          </div>
        )}
      </div>

      {/* Side margins for future expansion */}
      <div className="hidden lg:block flex-1 max-w-xs" />
    </div>
  )
}

export default ChatWindow