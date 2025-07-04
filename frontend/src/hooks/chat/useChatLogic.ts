import { useState, useCallback } from 'react'
import { useChatContext } from '@/src/contexts/ChatContext'
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications'
import { useSessionPersistence } from './useSessionPersistence'
import { usePhaseNavigation } from './usePhaseNavigation'
import { useResultHandling } from './useResultHandling'

export function useChatLogic() {
  const { state, sendMessage, clearError, resetChat, startConversation } = useChatContext()
  const toastHelpers = useToastHelpers()
  
  const [inputValue, setInputValue] = useState('')
  
  // Session persistence
  const sessionState = useSessionPersistence()
  
  // Phase navigation
  const navigation = usePhaseNavigation({
    selectedClass: sessionState.selectedClass,
    selectedSurvey: sessionState.selectedSurvey,
    surveySetupComplete: sessionState.surveySetupComplete,
    optimizationResult: sessionState.optimizationResult,
  })
  
  // Result handling
  const resultHandling = useResultHandling({
    optimizationResult: sessionState.optimizationResult,
    selectedSurvey: sessionState.selectedSurvey,
  }, sessionState.selectedSurvey)
  
  // Load student preferences for optimization
  const loadStudentPreferences = useCallback(async () => {
    if (!sessionState.selectedSurvey) return
    
    try {
      const response = await fetch(`/api/chat/surveys/${sessionState.selectedSurvey.id}/preferences`)
      const result = await response.json()
      
      if (result.success && result.data?.student_preferences) {
        sessionState.updateStudentPreferences(result.data.student_preferences)
      } else {
        sessionState.updateStudentPreferences([])
        toastHelpers.warning('注意', 'このアンケートには選好データが登録されていません')
      }
    } catch (error) {
      console.error('Error loading student preferences:', error)
      sessionState.updateStudentPreferences([])
      toastHelpers.error('読み込みエラー', '選好データの読み込みに失敗しました')
    }
  }, [sessionState, toastHelpers])

  // Enhanced navigation handlers
  const handleNextPhase = useCallback(async () => {
    try {
      // TODO: Fix when constraint_setting is being developped.
      // Load student preferences before moving to optimization
      if (
        (state.currentStep === 'constraint_setting' || state.currentStep === 'survey_setup') &&
        sessionState.selectedSurvey
      ) {
        await loadStudentPreferences();
      }
      
      await navigation.handleNext()
    } catch (error) {
      toastHelpers.error('エラー', 'フェーズの移行に失敗しました')
    }
  }, [state.currentStep, sessionState.selectedSurvey, loadStudentPreferences, navigation, toastHelpers])

  const handleBackPhase = useCallback(async () => {
    try {
      await navigation.handleBack()
    } catch (error) {
      toastHelpers.error('エラー', 'フェーズの移行に失敗しました')
    }
  }, [navigation, toastHelpers])

  // Chat reset with session cleanup
  const handleChatReset = useCallback(async () => {
    try {
      resetChat()
      sessionState.clearAllSession()
      await startConversation()
      toastHelpers.success('チャットリセット', '新しい会話を開始しました')
    } catch (error) {
      console.error('Error resetting chat:', error)
      toastHelpers.error('エラー', 'チャットのリセットに失敗しました')
    }
  }, [resetChat, sessionState, startConversation, toastHelpers])

  // Message handling
  const handleSendMessage = useCallback(async (content: string, file?: File) => {
    if (!content.trim() && !file) return
    
    setInputValue('')
    await sendMessage(content, file)
  }, [sendMessage])

  // Format timestamp helper (convert to JST)
  const formatDateTime = useCallback((isoString: string): string => {
    const dt = new Date(isoString)
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo',
    })
    const parts = formatter.formatToParts(dt)
    const pick = (type: string) => parts.find(p => p.type === type)?.value ?? ''
    return `${pick('year')}/${pick('month')}/${pick('day')} ${pick('hour')}:${pick('minute')}:${pick('second')}`
  }, [])

  return {
    // Chat state
    chatState: state,
    inputValue,
    setInputValue,
    
    // Session state
    ...sessionState,
    
    // Navigation
    ...navigation,
    handleNextPhase,
    handleBackPhase,
    
    // Result handling
    ...resultHandling,
    
    // Chat actions
    handleSendMessage,
    handleChatReset,
    loadStudentPreferences,
    clearError,
    
    // Utilities
    formatDateTime,
    
    // UI state helpers
    shouldShowChatInterface: state.currentStep === 'constraint_setting',
    // Always show the Navigator once session state is mounted
    shouldShowNavigator: sessionState.mounted,
  }
}