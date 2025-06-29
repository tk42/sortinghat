'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/src/lib/interfaces';

interface ChatMessageProps {
  message: ChatMessageType;
  onActionClick?: (action: string, data?: any) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const isUser = message.message_type === 'user';
  const isSystem = message.message_type === 'system';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isSystem) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-full">
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-700">システム</span>
          </div>
          
          <p className="text-sm text-blue-800 mb-3 whitespace-pre-wrap">{message.content}</p>
          
          {/* Step Indicator */}
          {message.metadata.step_indicator && (
            <div className="bg-white rounded-md p-2 mb-3 border border-blue-200">
              <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                <span>{message.metadata.step_indicator.step_name}</span>
                <span>{message.metadata.step_indicator.current}/{message.metadata.step_indicator.total}</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(message.metadata.step_indicator.current / message.metadata.step_indicator.total) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {message.metadata.actions && message.metadata.actions.length > 0 && (
            <div className="space-y-2">
              {message.metadata.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick?.(action.action, action.data)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-md transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Progress Bar */}
          {message.metadata.progress && (
            <div className="bg-white rounded-md p-2 border border-blue-200">
              <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                <span>{message.metadata.progress.status}</span>
                <span>{message.metadata.progress.current}/{message.metadata.progress.total}</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(message.metadata.progress.current / message.metadata.progress.total) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-1">{formatTime(message.created_at)}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-green-500' : 'bg-gray-500'
          }`}>
            {isUser ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Message Content */}
        <div className="flex flex-col">
          <div className={`rounded-lg px-3 py-2 ${
            isUser 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* File References */}
            {message.metadata.file_references && message.metadata.file_references.length > 0 && (
              <div className="mt-2 pt-2 border-t border-opacity-20 border-current">
                <div className="text-xs opacity-75">添付ファイル:</div>
                {message.metadata.file_references.map((filename, index) => (
                  <div key={index} className="text-xs opacity-90 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {filename}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <span className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;