'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/src/contexts/ChatContext';
import { ChatMessage as ChatMessageType, ConversationStep, Class, Survey } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';
import DashboardHeader from '@/src/components/Common/DashboardHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import StepIndicator from './StepIndicator';
import FileUploadProgress from './FileUploadProgress';
import OptimizationProgress from './OptimizationProgress';
import FileConversionDiff from './FileConversionDiff';
import Navigator from './Navigator';
import { updateStudentTeams } from '@/src/utils/actions/update_student_teams';

// Phase Components
import StartPhase from './phases/StartPhase';
import ClassSetupPhase from './phases/ClassSetupPhase';
import SurveyCreationPhase from './phases/SurveyCreationPhase';
import SurveySetupPhase from './phases/SurveySetupPhase';
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
  
  // Phase-specific state with persistence
  const [selectedClass, setSelectedClass] = useState<Class | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chat-selected-class');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chat-selected-survey');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [studentPreferences, setStudentPreferences] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chat-student-preferences');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [optimizationResult, setOptimizationResult] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chat-optimization-result');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  // アンケート設定が完了しているか
  const [surveySetupComplete, setSurveySetupComplete] = useState(false);

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

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (selectedClass) {
      sessionStorage.setItem('chat-selected-class', JSON.stringify(selectedClass));
    } else {
      sessionStorage.removeItem('chat-selected-class');
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSurvey) {
      sessionStorage.setItem('chat-selected-survey', JSON.stringify(selectedSurvey));
    } else {
      sessionStorage.removeItem('chat-selected-survey');
    }
  }, [selectedSurvey]);

  useEffect(() => {
    if (studentPreferences.length > 0) {
      sessionStorage.setItem('chat-student-preferences', JSON.stringify(studentPreferences));
    } else {
      sessionStorage.removeItem('chat-student-preferences');
    }
  }, [studentPreferences]);

  useEffect(() => {
    if (optimizationResult) {
      sessionStorage.setItem('chat-optimization-result', JSON.stringify(optimizationResult));
    } else {
      sessionStorage.removeItem('chat-optimization-result');
    }
  }, [optimizationResult]);

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
        nextStep = 'survey_setup';
        break;
      case 'survey_setup':
        nextStep = 'optimization_execution';
        // nextStep = 'constraint_setting';
        break;
      case 'constraint_setting':
        nextStep = 'optimization_execution';
        if (selectedSurvey) {
          await loadStudentPreferences();
        }
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
    } catch (error) {
      console.error('Error moving to next phase:', error);
      toastHelpers.error('エラー', 'フェーズの移行に失敗しました');
    }
  };

  const loadStudentPreferences = async () => {
    if (!selectedSurvey) return;
    
    try {
      const response = await fetch(`/api/chat/surveys/${selectedSurvey.id}/preferences`);
      const result = await response.json();
      
      if (result.success && result.data?.student_preferences) {
        setStudentPreferences(result.data.student_preferences);
      } else {
        setStudentPreferences([]);
        toastHelpers.warning('注意', 'このアンケートには選好データが登録されていません');
      }
    } catch (error) {
      console.error('Error loading student preferences:', error);
      setStudentPreferences([]);
      toastHelpers.error('読み込みエラー', '選好データの読み込みに失敗しました');
    }
  };

  const getStepLabel = (step: ConversationStep): string => {
    switch (step) {
      case 'initial': return '開始';
      case 'class_setup': return 'クラス設定';
      case 'survey_creation': return 'アンケート作成';
      case 'survey_setup': return 'アンケート設定';
      case 'constraint_setting': return '制約設定';
      case 'optimization_execution': return '最適化実行';
      case 'result_confirmation': return '結果確認';
      default: return step;
    }
  };

  const getNextDisabled = (): boolean => {
    switch (state.currentStep) {
      case 'initial':
        return !selectedClass;
      case 'class_setup':
        // Would need to check if students are loaded, but for now assume enabled
        return false;
      case 'survey_creation':
        return !selectedSurvey;
      case 'survey_setup':
        return !surveySetupComplete;
      case 'constraint_setting':
        // Could check if constraints are set properly
        return false;
      case 'optimization_execution':
        return !optimizationResult;
      case 'result_confirmation':
        return true; // No next button for final step
      default:
        return false;
    }
  };

  const handleBackPhase = async () => {
    const currentStep = state.currentStep;
    let previousStep: ConversationStep | null = null;
    
    switch (currentStep) {
      case 'class_setup':
        previousStep = 'initial';
        break;
      case 'survey_creation':
        previousStep = 'class_setup';
        break;
      case 'survey_setup':
        previousStep = 'survey_creation';
        break;
      case 'constraint_setting':
        previousStep = 'survey_setup';
        break;
      case 'optimization_execution':
        // previousStep = 'constraint_setting';
        previousStep = 'survey_setup';
        break;
      case 'result_confirmation':
        previousStep = 'optimization_execution';
        break;
      default:
        return; // No back navigation for 'initial' or unknown steps
    }
    
    if (previousStep) {
      try {
        await moveToStep(previousStep);
      } catch (error) {
        console.error('Error moving back:', error);
        toastHelpers.error('エラー', 'フェーズの移行に失敗しました');
      }
    }
  };
  
  const getFooterInfoText = (): string => {
    switch (state.currentStep) {
      case 'initial':
        return selectedClass ? `選択中のクラス: ${selectedClass.name}` : '';
      case 'class_setup':
        return '生徒名簿を確認・編集してください';
      case 'survey_creation':
        return selectedSurvey ? `選択中のアンケート: ${selectedSurvey.name}` : '';
      case 'survey_setup':
        return 'アンケート結果データを確認・編集してください';
      case 'constraint_setting':
        return '制約条件の設定が完了したら次に進んでください';
      case 'optimization_execution':
        return '最適化の実行結果を確認してください';
      case 'result_confirmation':
        return '班分け結果を確認してください';
      default:
        return '';
    }
  };

  const renderPhaseContent = () => {
    switch (state.currentStep) {
      case 'initial':
        return (
          <StartPhase
            onClassSelect={setSelectedClass}
            selectedClass={selectedClass}
          />
        );
      case 'class_setup':
        return (
          <ClassSetupPhase
            selectedClass={selectedClass}
          />
        );
      case 'survey_creation':
        return (
          <SurveyCreationPhase
            selectedClass={selectedClass}
            onSurveySelect={setSelectedSurvey}
            selectedSurvey={selectedSurvey}
          />
        );
      case 'survey_setup':
        return (
          <SurveySetupPhase
            selectedSurvey={selectedSurvey}
            onStatusChange={setSurveySetupComplete}
          />
        );
      case 'constraint_setting':
        return (
          <ConstraintSettingPhase
            selectedClass={selectedClass}
            selectedSurvey={selectedSurvey}
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
            selectedSurvey={selectedSurvey}
            studentPreferences={studentPreferences}
            onOptimizationComplete={setOptimizationResult}
          />
        );
      case 'result_confirmation':
        return (
          <ResultConfirmationPhase
            matchingResult={optimizationResult}
          />
        );
      default:
        return <div>Unknown phase {state.currentStep}</div>;
    }
  };

  // Only show chat interface for constraint setting phase
  const shouldShowChatInterface = state.currentStep === 'constraint_setting';

  // ===== Result Confirmation utilities =====
  // CSV エクスポート
  const handleExportResults = () => {
    toastHelpers.success('エクスポート', '結果をCSVファイルでダウンロードしました');
  };

  // 結果保存
  const handleSaveResults = async () => {
    if (!optimizationResult || !optimizationResult.teams || !optimizationResult.survey) {
      toastHelpers.error('エラー', '保存する結果がありません');
      return;
    }

    // teams が配列形式の場合は Record<string, number[]> に変換
    let teamsMapping: Record<string, number[]> = {};
    if (Array.isArray(optimizationResult.teams)) {
      optimizationResult.teams.forEach((team: any, idx: number) => {
        const teamId = team.team_id ?? idx;
        const studentNos = team.students
          ? team.students.map((s: any) =>
              s.student_no !== undefined ? s.student_no : s
            )
          : [];
        teamsMapping[teamId.toString()] = studentNos;
      });
    } else {
      teamsMapping = optimizationResult.teams as Record<string, number[]>;
    }

    try {
      toastHelpers.info('保存中', '班分け結果を保存しています...');
      await updateStudentTeams(teamsMapping, optimizationResult.survey.id);
      toastHelpers.success('保存完了', '班分け結果を保存しました');
    } catch (error) {
      console.error('Error saving matching results:', error);
      toastHelpers.error('保存失敗', '班分け結果の保存に失敗しました');
    }
  };

  // チーム数・生徒数の算出
  const { teams: teamsCount, students: studentsCount } = React.useMemo(() => {
    if (!optimizationResult || !optimizationResult.teams) {
      return { teams: 0, students: 0 };
    }

    // teams が配列またはオブジェクトの場合を吸収
    const teamsArray: any[] = Array.isArray(optimizationResult.teams)
      ? optimizationResult.teams
      : Object.values(optimizationResult.teams);

    const studentSet = new Set<number>();
    teamsArray.forEach((team: any) => {
      if (team.students) {
        team.students.forEach((s: any) => {
          // id / student_id / student_no など可能性のあるキーを順に確認
          if (s.id !== undefined) {
            studentSet.add(s.id);
          } else if (s.student_id !== undefined) {
            studentSet.add(s.student_id);
          } else if (s.student_no !== undefined) {
            studentSet.add(s.student_no);
          }
        });
      }
    });

    return { teams: teamsArray.length, students: studentSet.size };
  }, [optimizationResult]);

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
            currentStep={state.currentStep}
            completedSteps={[]} // TODO: Track completed steps
          />
        </div>

        {/* Navigator - positioned right after Step Indicator */}
        {(state.currentStep !== 'initial' || selectedClass) && (
          <Navigator
            currentStep={state.currentStep}
            onBack={handleBackPhase}
            onNext={handleNextPhase}
            isLoading={state.isLoading}
            nextDisabled={getNextDisabled()}
            nextTooltip={state.currentStep === 'survey_setup' && !surveySetupComplete ? '未設定の生徒がいます' : undefined}
            showInfo={true}
            infoText={getFooterInfoText()}
            teamsCount={state.currentStep === 'result_confirmation' ? teamsCount : undefined}
            studentsCount={state.currentStep === 'result_confirmation' ? studentsCount : undefined}
            onExportResults={state.currentStep === 'result_confirmation' ? handleExportResults : undefined}
            onSaveResults={state.currentStep === 'result_confirmation' ? handleSaveResults : undefined}
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
    </div>
  );
};

export default ChatWindow;