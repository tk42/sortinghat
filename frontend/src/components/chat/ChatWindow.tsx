'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/src/contexts/ChatContext';
import { ChatMessage as ChatMessageType, ConversationStep } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import StepIndicator from './StepIndicator';
import FileUploadProgress from './FileUploadProgress';
import OptimizationProgress from './OptimizationProgress';
import FileConversionDiff from './FileConversionDiff';
import UserAvatarButton from '@/src/components/navigation/UserAvatarButton';

const ChatWindow: React.FC = () => {
  const { state, sendMessage, uploadFile, clearError } = useChatContext();
  const toastHelpers = useToastHelpers();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [shouldPreserveScroll, setShouldPreserveScroll] = useState(false);

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
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">班分けアシスタント</h1>
                <p className="text-sm text-gray-500">
                  {state.conversation ? `会話 #${state.conversation.id}` : 'AIがお手伝いします'}
                </p>
              </div>
            </div>
            
            {/* Optional: Action buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                title="チャットをリフレッシュ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        {state.conversation && (
          <div className="border-b border-gray-200">
            <StepIndicator 
              currentStep={state.currentStep}
              completedSteps={[]} // TODO: Track completed steps
            />
          </div>
        )}

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          data-chat-container // For scroll position saving
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0"
        >
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

          {state.messages.length === 0 && !state.isLoading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                班分け最適化を始めましょう
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                AIアシスタントがクラスの班分けを最適化するお手伝いをします。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setInputValue('班分けを始めたいです。手順を教えてください。')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  班分けを開始
                </button>
              </div>
            </div>
          )}

          {state.messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              onActionClick={(action, data) => {
                console.log('Action clicked:', action, data);
                // Handle action clicks
              }}
            />
          ))}

          {state.isTyping && (
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>アシスタントが入力中...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
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

        {/* Input Area */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            disabled={state.isLoading}
            placeholder="メッセージを入力してください..."
          />
        </div>
      </div>

      {/* Side margins for future expansion */}
      <div className="hidden lg:block flex-1 max-w-xs" />

      {/* User Avatar Button */}
      <UserAvatarButton />
    </div>
  );
};

export default ChatWindow;