'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/src/contexts/ChatContext';
import { useDrawer } from '@/src/contexts/DrawerContext';
import { ChatMessage as ChatMessageType, ConversationStep } from '@/src/lib/interfaces';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import StepIndicator from './StepIndicator';
import FileUploadProgress from './FileUploadProgress';
import OptimizationProgress from './OptimizationProgress';
import FileConversionDiff from './FileConversionDiff';

const ChatInterface: React.FC = () => {
  const { state, sendMessage, uploadFile, clearError } = useChatContext();
  const { isDrawerOpen, drawerType, setIsDrawerOpen } = useDrawer();
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

  // Save scroll position before leaving chat
  useEffect(() => {
    const saveScrollPosition = () => {
      if (messagesContainerRef.current && state.conversation) {
        const scrollTop = messagesContainerRef.current.scrollTop;
        sessionStorage.setItem(`chat-scroll-${state.conversation.id}`, scrollTop.toString());
      }
    };

    if (isDrawerOpen && drawerType === 'chat') {
      // Restore scroll position when chat opens
      const restoreScrollPosition = () => {
        if (messagesContainerRef.current && state.conversation) {
          const savedScrollTop = sessionStorage.getItem(`chat-scroll-${state.conversation.id}`);
          if (savedScrollTop) {
            messagesContainerRef.current.scrollTop = parseInt(savedScrollTop);
            setShouldPreserveScroll(true);
            // Reset after a short delay to allow normal scrolling
            setTimeout(() => setShouldPreserveScroll(false), 1000);
          }
        }
      };

      // Small delay to ensure DOM is ready
      setTimeout(restoreScrollPosition, 100);
      
      // Save scroll position when scrolling
      const container = messagesContainerRef.current;
      if (container) {
        container.addEventListener('scroll', saveScrollPosition);
        return () => container.removeEventListener('scroll', saveScrollPosition);
      }
    } else if (!isDrawerOpen) {
      // Save scroll position when closing chat
      saveScrollPosition();
    }
  }, [isDrawerOpen, drawerType, state.conversation]);

  // Detect if user is scrolled up to prevent auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldPreserveScroll(!isNearBottom);
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
  };

  const handleConversionConfirm = async (jobId: number) => {
    // Call API to confirm conversion
    try {
      const response = await fetch('/api/chat/file-conversion/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      });
      
      if (response.ok) {
        await sendMessage('ファイル変換を承認しました。次のステップに進んでください。');
      }
    } catch (error) {
      console.error('Error confirming conversion:', error);
    }
  };

  const handleConversionReject = async (jobId: number) => {
    // Call API to reject conversion and retry
    try {
      const response = await fetch('/api/chat/file-conversion/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      });
      
      if (response.ok) {
        await sendMessage('ファイル変換をやり直します。再度ファイルをアップロードしてください。');
      }
    } catch (error) {
      console.error('Error rejecting conversion:', error);
    }
  };

  const handleConversionModify = async (jobId: number, modifications: any) => {
    // Call API to apply modifications
    try {
      const response = await fetch('/api/chat/file-conversion/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, modifications })
      });
      
      if (response.ok) {
        await sendMessage('ファイル変換に修正を適用しました。');
      }
    } catch (error) {
      console.error('Error modifying conversion:', error);
    }
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
  };

  if (drawerType !== 'chat' || !isDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">班分けアシスタント</h3>
            <p className="text-sm text-gray-500">
              {state.conversation ? `会話 #${state.conversation.id}` : '新しい会話'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Step Indicator */}
      {state.conversation && (
        <StepIndicator 
          currentStep={state.currentStep}
          completedSteps={[]} // TODO: Track completed steps
        />
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              会話を開始するには、メッセージを送信してください
            </p>
          </div>
        )}

        {state.messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            onActionClick={(action, data) => {
              // Handle action clicks (e.g., buttons in messages)
              console.log('Action clicked:', action, data);
            }}
          />
        ))}

        {state.isTyping && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
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
        <div className="border-t border-gray-200 p-4 space-y-4">
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
        <div className="border-t border-gray-200 p-4">
          <OptimizationProgress job={state.optimizationJob} />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
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
  );
};

export default ChatInterface;