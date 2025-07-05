import { useCallback } from 'react'
import { ConversationStep } from '@/src/lib/types'
import { useChatContext } from '@/src/contexts/ChatContext'

interface PhaseNavigationState {
  selectedClass: any
  selectedSurvey: any
  surveySetupComplete: boolean
  optimizationResult: any
}

export function usePhaseNavigation(state: PhaseNavigationState) {
  const { state: chatState, moveToStep, startConversation } = useChatContext()

  const getNextStep = useCallback((currentStep: ConversationStep): ConversationStep | null => {
    switch (currentStep) {
      case 'initial':
        return 'class_setup'
      case 'class_setup':
        return 'survey_creation'
      case 'survey_creation':
        return 'survey_setup'
      case 'survey_setup':
        return 'optimization_execution'
      // case 'constraint_setting':
      //   return 'optimization_execution'
      case 'optimization_execution':
        return 'result_confirmation'
      default:
        return null
    }
  }, [])

  const getPreviousStep = useCallback((currentStep: ConversationStep): ConversationStep | null => {
    switch (currentStep) {
      case 'class_setup':
        return 'initial'
      case 'survey_creation':
        return 'class_setup'
      case 'survey_setup':
        return 'survey_creation'
      // case 'constraint_setting':
      //   return 'survey_setup'
      case 'optimization_execution':
        return 'survey_setup' // Skip constraint_setting
      case 'result_confirmation':
        return 'optimization_execution'
      default:
        return null
    }
  }, [])

  const canMoveNext = useCallback((currentStep: ConversationStep): boolean => {
    switch (currentStep) {
      case 'initial':
        return !!state.selectedClass
      case 'class_setup':
        return true // Assume students are loaded
      case 'survey_creation':
        return !!state.selectedSurvey
      case 'survey_setup':
        return state.surveySetupComplete
      case 'constraint_setting':
        return true // Could check if constraints are set
      case 'optimization_execution':
        return !!state.optimizationResult
      case 'result_confirmation':
        return false // No next step
      default:
        return false
    }
  }, [state])

  const getStepLabel = useCallback((step: ConversationStep): string => {
    switch (step) {
      case 'initial': return '開始'
      case 'class_setup': return 'クラス設定'
      case 'survey_creation': return 'アンケート作成'
      case 'survey_setup': return 'アンケート設定'
      case 'constraint_setting': return '制約設定'
      case 'optimization_execution': return '最適化実行'
      case 'result_confirmation': return '結果確認'
      default: return step
    }
  }, [])

  const getInfoText = useCallback((currentStep: ConversationStep): string => {
    switch (currentStep) {
      case 'initial':
        return state.selectedClass ? `選択中のクラス: ${state.selectedClass.name}` : ''
      case 'class_setup':
        return '生徒名簿を確認・編集してください'
      case 'survey_creation':
        return state.selectedSurvey ? `選択中のアンケート: ${state.selectedSurvey.name}` : ''
      case 'survey_setup':
        return 'アンケート結果データを確認・編集してください'
      case 'constraint_setting':
        return '制約条件の設定が完了したら次に進んでください'
      case 'optimization_execution':
        return '最適化の実行結果を確認してください'
      case 'result_confirmation':
        return '班分け結果を確認してください'
      default:
        return ''
    }
  }, [state])

  const getNextTooltip = useCallback((currentStep: ConversationStep): string | undefined => {
    if (currentStep === 'survey_setup' && !state.surveySetupComplete) {
      return '未設定の生徒がいます'
    }
    return undefined
  }, [state])

  const handleNext = useCallback(async (): Promise<void> => {
    const nextStep = getNextStep(chatState.currentStep)
    if (!nextStep) return

    try {
      // Setup フェーズでは会話を作成しない。
      // ConstraintSettingPhase へ遷移するタイミングでのみ新規会話を開始する。
      if (!chatState.conversation && nextStep === 'constraint_setting') {
        await startConversation()
      }
      
      // Move to the next step
      await moveToStep(nextStep)
    } catch (error) {
      console.error('Error moving to next phase:', error)
      throw error
    }
  }, [chatState.currentStep, chatState.conversation, getNextStep, moveToStep, startConversation])

  const handleBack = useCallback(async (): Promise<void> => {
    const previousStep = getPreviousStep(chatState.currentStep)
    if (!previousStep) return

    try {
      await moveToStep(previousStep)
    } catch (error) {
      console.error('Error moving back:', error)
      throw error
    }
  }, [chatState.currentStep, getPreviousStep, moveToStep])

  return {
    currentStep: chatState.currentStep,
    canMoveNext: canMoveNext(chatState.currentStep),
    canMoveBack: getPreviousStep(chatState.currentStep) !== null,
    getStepLabel,
    getInfoText: () => getInfoText(chatState.currentStep),
    getNextTooltip: () => getNextTooltip(chatState.currentStep),
    handleNext,
    handleBack,
  }
}