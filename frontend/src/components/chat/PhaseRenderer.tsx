import React from 'react'
import { ConversationStep, Class, Survey } from '@/src/lib/types'
import { MutableRefObject, Dispatch, SetStateAction } from 'react'
import { BackHandler } from './ChatWindow'

// Phase Components
import StartPhase from './phases/StartPhase'
import ClassSetupPhase from './phases/ClassSetupPhase'
import SurveyCreationPhase from './phases/SurveyCreationPhase'
import SurveySetupPhase from './phases/SurveySetupPhase'
import ConstraintSettingPhase from './phases/ConstraintSettingPhase'
import OptimizationExecutionPhase from './phases/OptimizationExecutionPhase'
import ResultConfirmationPhase from './phases/ResultConfirmationPhase'

interface PhaseRendererProps {
  currentStep: ConversationStep
  selectedClass: Class | null
  selectedSurvey: Survey | null
  studentPreferences: any[]
  optimizationResult: any
  messages: any[]
  inputValue: string
  isLoading: boolean
  isTyping: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  onClassSelect: (classItem: Class) => void
  onSurveySelect: (survey: Survey) => void
  onSurveySetupComplete: (complete: boolean) => void
  onOptimizationComplete: (result: any) => void
  onSendMessage: (content: string, file?: File) => void
  onInputChange: (value: string) => void
  internalBackRef: MutableRefObject<BackHandler | undefined>
  setInternalBackActive: Dispatch<SetStateAction<boolean>>
}

export default function PhaseRenderer({
  currentStep,
  selectedClass,
  selectedSurvey,
  studentPreferences,
  optimizationResult,
  messages,
  inputValue,
  isLoading,
  isTyping,
  messagesEndRef,
  onClassSelect,
  onSurveySelect,
  onSurveySetupComplete,
  onOptimizationComplete,
  onSendMessage,
  onInputChange,
  internalBackRef,
  setInternalBackActive,
}: PhaseRendererProps) {
  switch (currentStep) {
    case 'initial':
      return (
        <StartPhase
          onClassSelect={onClassSelect}
          selectedClass={selectedClass}
          internalBackRef={internalBackRef}
          setInternalBackActive={setInternalBackActive}
        />
      )
      
    case 'class_setup':
      return (
        <ClassSetupPhase
          selectedClass={selectedClass}
        />
      )
      
    case 'survey_creation':
      return (
        <SurveyCreationPhase
          selectedClass={selectedClass}
          onSurveySelect={onSurveySelect}
          selectedSurvey={selectedSurvey}
          internalBackRef={internalBackRef}
          setInternalBackActive={setInternalBackActive}
        />
      )
      
    case 'survey_setup':
      return (
        <SurveySetupPhase
          selectedSurvey={selectedSurvey}
          onStatusChange={onSurveySetupComplete}
        />
      )
      
    case 'constraint_setting':
      return (
        <ConstraintSettingPhase
          selectedClass={selectedClass}
          selectedSurvey={selectedSurvey}
          messages={messages}
          onSendMessage={onSendMessage}
          inputValue={inputValue}
          onInputChange={onInputChange}
          isLoading={isLoading}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
      )
      
    case 'optimization_execution':
      return (
        <OptimizationExecutionPhase
          selectedSurvey={selectedSurvey}
          studentPreferences={studentPreferences}
          onOptimizationComplete={onOptimizationComplete}
        />
      )
      
    case 'result_confirmation':
      return (
        <ResultConfirmationPhase
          matchingResult={optimizationResult}
        />
      )
      
    default:
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unknown Phase
            </h2>
            <p className="text-gray-600">
              Phase &quot;{currentStep}&quot; is not recognized
            </p>
          </div>
        </div>
      )
  }
}