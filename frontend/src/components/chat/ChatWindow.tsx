'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/src/contexts/ChatContext';
import { ChatMessage as ChatMessageType, ConversationStep, Class, Survey } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';
import { Container as Logo } from "@/src/components/Common/Logo";
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import StepIndicator from './StepIndicator';
import FileUploadProgress from './FileUploadProgress';
import OptimizationProgress from './OptimizationProgress';
import FileConversionDiff from './FileConversionDiff';
import UserAvatarButton from '@/src/components/navigation/UserAvatarButton';

// Phase Components
import StartPhase from './phases/StartPhase';
import ClassSetupPhase from './phases/ClassSetupPhase';
import SurveyCreationPhase from './phases/SurveyCreationPhase';
import ConstraintSettingPhase from './phases/ConstraintSettingPhase';
import OptimizationExecutionPhase from './phases/OptimizationExecutionPhase';
import ResultConfirmationPhase from './phases/ResultConfirmationPhase';

const ChatWindow: React.FC = () => {
  const { state, sendMessage, uploadFile, clearError, resetChat, startConversation, moveToStep } = useChatContext();
  const toastHelpers = useToastHelpers();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [shouldPreserveScroll, setShouldPreserveScroll] = useState(false);
  
  // Phase-specific state
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // Helper: Formats ISO timestamp to "YYYY/MM/DD HH:MM:SS"
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
  };

  // Auto-scroll to bottom when new messages arrive, but preserve scroll position when needed
  useEffect(() => {
    if (!shouldPreserveScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages, shouldPreserveScroll]);

  // Restore scroll position on mount (for returning from other pages)
  useEffect(() => {
    const restoreScrollPosition = () => {
      const savedScrollTop = sessionStorage.getItem('dashboard-scroll-position');
      if (savedScrollTop && messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = parseInt(savedScrollTop);
        setShouldPreserveScroll(true);
        setTimeout(() => setShouldPreserveScroll(false), 1000);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(restoreScrollPosition, 100);
  }, []);

  // Save scroll position when scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldPreserveScroll(!isNearBottom);
      
      // Save scroll position for route navigation
      sessionStorage.setItem('dashboard-scroll-position', scrollTop.toString());
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;
    
    setInputValue('');
    await sendMessage(content, file);
  };

  const handleFileUpload = async (file: File) => {
    await uploadFile(file, 'csv_import');
    toastHelpers.info('ファイルアップロード開始', `「${file.name}」の処理を開始しました`);
  };

  const handleConversionConfirm = async (jobId: number) => {
    try {
      const response = await fetch('/api/chat/file-conversion/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      });
      
      if (response.ok) {
        await sendMessage('ファイル変換を承認しました。次のステップに進んでください。');
        toastHelpers.success('変換承認', 'ファイル変換が承認されました');
      }
    } catch (error) {
      console.error('Error confirming conversion:', error);
      toastHelpers.error('エラー', '変換の承認に失敗しました');
    }
  };

  const handleConversionReject = async (jobId: number) => {
    try {
      const response = await fetch('/api/chat/file-conversion/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      });
      
      if (response.ok) {
        await sendMessage('ファイル変換をやり直します。再度ファイルをアップロードしてください。');
        toastHelpers.warning('変換やり直し', '新しいファイルをアップロードしてください');
      }
    } catch (error) {
      console.error('Error rejecting conversion:', error);
      toastHelpers.error('エラー', '変換の拒否に失敗しました');
    }
  };

  const handleConversionModify = async (jobId: number, modifications: any) => {
    try {
      const response = await fetch('/api/chat/file-conversion/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, modifications })
      });
      
      if (response.ok) {
        await sendMessage('ファイル変換に修正を適用しました。');
        toastHelpers.success('修正適用', 'ファイルの修正が適用されました');
      }
    } catch (error) {
      console.error('Error modifying conversion:', error);
      toastHelpers.error('エラー', '修正の適用に失敗しました');
    }
  };

  const handleChatReset = async () => {
    try {
      resetChat();
      sessionStorage.removeItem('dashboard-scroll-position');
      setSelectedClass(null);
      setSelectedSurvey(null);
      await startConversation();
      toastHelpers.success('チャットリセット', '新しい会話を開始しました');
    } catch (error) {
      console.error('Error resetting chat:', error);
      toastHelpers.error('エラー', 'チャットのリセットに失敗しました');
    }
  };

  const handleNextPhase = async () => {
    const currentStep = state.currentStep;
    let nextStep: ConversationStep;
    
    switch (currentStep) {
      case 'initial':
        nextStep = 'class_setup';
        break;
      case 'class_setup':
        nextStep = 'survey_creation';
        break;
      case 'survey_creation':
        nextStep = 'constraint_setting';
        break;
      case 'constraint_setting':
        nextStep = 'optimization_execution';
        break;
      case 'optimization_execution':
        nextStep = 'result_confirmation';
        break;
      default:
        return;
    }
    
    try {
      // If no conversation exists, start one first
      if (!state.conversation) {
        await startConversation();
      }
      // Move to the next step
      await moveToStep(nextStep);
      toastHelpers.success('フェーズ移行', `${getStepLabel(nextStep)}に移行しました`);
    } catch (error) {
      console.error('Error moving to next phase:', error);
      toastHelpers.error('エラー', 'フェーズの移行に失敗しました');
    }
  };

  const getStepLabel = (step: ConversationStep): string => {
    switch (step) {
      case 'initial': return '開始';
      case 'class_setup': return 'クラス設定';
      case 'survey_creation': return 'アンケート作成';
      case 'constraint_setting': return '制約設定';
      case 'optimization_execution': return '最適化実行';
      case 'result_confirmation': return '結果確認';
      default: return step;
    }
  };

  const handleBackPhase = async () => {
    if (state.currentStep === 'result_confirmation') {
      try {
        await moveToStep('constraint_setting');
        toastHelpers.success('フェーズ移行', '制約設定に戻りました');
      } catch (error) {
        console.error('Error moving back to constraint setting:', error);
        toastHelpers.error('エラー', 'フェーズの移行に失敗しました');
      }
    }
  };

  const renderPhaseContent = () => {
    switch (state.currentStep) {
      case 'initial':
        return (
          <StartPhase
            onClassSelect={setSelectedClass}
            onNext={handleNextPhase}
            selectedClass={selectedClass}
          />
        );
      case 'class_setup':
        return (
          <ClassSetupPhase
            selectedClass={selectedClass}
            onNext={handleNextPhase}
          />
        );
      case 'survey_creation':
        return (
          <SurveyCreationPhase
            selectedClass={selectedClass}
            onSurveySelect={setSelectedSurvey}
            onNext={handleNextPhase}
            selectedSurvey={selectedSurvey}
          />
        );
      case 'constraint_setting':
        return (
          <ConstraintSettingPhase
            selectedClass={selectedClass}
            selectedSurvey={selectedSurvey}
            onNext={handleNextPhase}
            messages={state.messages}
            onSendMessage={handleSendMessage}
            inputValue={inputValue}
            onInputChange={setInputValue}
            isLoading={state.isLoading}
            isTyping={state.isTyping}
            messagesEndRef={messagesEndRef}
          />
        );
      case 'optimization_execution':
        return (
          <OptimizationExecutionPhase
            selectedClass={selectedClass}
            selectedSurvey={selectedSurvey}
            onNext={handleNextPhase}
            optimizationJob={state.optimizationJob}
          />
        );
      case 'result_confirmation':
        return (
          <ResultConfirmationPhase
            optimizationJob={state.optimizationJob}
            onBack={handleBackPhase}
          />
        );
      default:
        return <div>Unknown phase {state.currentStep}</div>;
    }
  };

  // Only show chat interface for constraint setting phase
  const shouldShowChatInterface = state.currentStep === 'constraint_setting';

  return (
    <div className="min-h-screen flex">
      {/* Side margins for future expansion */}
      <div className="hidden lg:block flex-1 max-w-xs" />
      
      {/* Main chat area */}
      <div className="w-full max-w-[80%] mx-auto flex flex-col bg-white shadow-lg">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center">
                <Logo brand={false} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SYNERGY MATCH MAKER</h1>
                <p className="text-sm text-gray-500">
                  {state.conversation ? `${formatDateTime(state.conversation.created_at)}` : 'AIがお手伝いします'}
                </p>
              </div>
            </div>
            
            {/* Optional: Action buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleChatReset}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                title="チャットをリセット"
                disabled={state.isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="border-b border-gray-200">
          <StepIndicator 
            currentStep={state.currentStep}
            completedSteps={[]} // TODO: Track completed steps
          />
        </div>

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

          {renderPhaseContent()}
        </div>

        {/* File Processing Progress */}
        {state.fileProcessingJobs.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 space-y-4 bg-gray-50">
            {state.fileProcessingJobs.map((job) => (
              <div key={job.id} className="space-y-3">
                <FileUploadProgress job={job} />
                
                {/* Show conversion diff if available */}
                {job.status === 'completed' && 
                 job.processing_type === 'llm_conversion' && 
                 job.result_data.conversion_diff && (
                  <FileConversionDiff
                    job={job}
                    onConfirm={handleConversionConfirm}
                    onReject={handleConversionReject}
                    onModify={handleConversionModify}
                  />
                )}
              </div>
            ))}
          </div>
        )}

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
              onFileUpload={handleFileUpload}
              disabled={state.isLoading}
              placeholder="制約条件を自然言語で入力してください..."
            />
          </div>
        )}
      </div>

      {/* Side margins for future expansion */}
      <div className="hidden lg:block flex-1 max-w-xs" />

      {/* User Avatar Button */}
      <UserAvatarButton />
    </div>
  );
};

export default ChatWindow;