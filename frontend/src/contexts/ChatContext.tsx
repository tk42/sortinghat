'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  ChatState, 
  ChatAction, 
  Conversation, 
  ChatMessage, 
  ConversationStep,
  OptimizationJob,
  SendMessageRequest,
  ChatResponse
} from '@/src/lib/interfaces';
import { useAuthContext } from '@/src/utils/firebase/authprovider';

// Initial state
const initialState: ChatState = {
  conversation: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  currentStep: 'initial',
  optimizationJob: null,
  error: null,
};

// Reducer function
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CONVERSATION':
      return {
        ...state,
        conversation: action.payload,
        currentStep: action.payload.current_step ?? 'initial',
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isTyping: false,
      };
    
    case 'UPDATE_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
        conversation: state.conversation ? {
          ...state.conversation,
          current_step: action.payload,
        } : null,
      };
    
    case 'SET_OPTIMIZATION_JOB':
      return {
        ...state,
        optimizationJob: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isTyping: false,
      };
    
    case 'RESET_CHAT':
      return initialState;
    
    default:
      return state;
  }
};

// Context interface
interface ChatContextType {
  state: ChatState;
  // Conversation management
  startConversation: () => Promise<void>;
  loadConversation: (conversationId: number) => Promise<void>;
  resumeLastConversation: () => Promise<void>;
  
  // Message handling
  sendMessage: (content: string, file?: File) => Promise<void>;
  
  // Step management
  moveToStep: (step: ConversationStep) => Promise<void>;
  completeCurrentStep: (stepData?: Record<string, any>) => Promise<void>;
  
  // Optimization
  startOptimization: (constraints: any, surveyId?: number) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  resetChat: () => void;
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { state: authState } = useAuthContext();

  // Start a new conversation
  const startConversation = useCallback(async () => {
    if (!authState.teacher) {
      dispatch({ type: 'SET_ERROR', payload: 'ログインが必要です' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/chat/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: authState.teacher.id,
          session_id: `session_${Date.now()}`,
        }),
      });

      const result: ChatResponse = await response.json();
      
      if (result.success && result.data?.conversation) {
        dispatch({ type: 'SET_CONVERSATION', payload: result.data.conversation });
        
        // Add initial welcome message
        const welcomeMessage: ChatMessage = {
          id: 0,
          conversation_id: result.data.conversation.id,
          message_type: 'system',
          content: 'こんにちは！班分け最適化アシスタントです。まずはクラス情報の設定から始めましょう。',
          metadata: {
            step_indicator: {
              current: 1,
              total: 5,
              step_name: 'クラス設定',
            },
            actions: [
              { label: 'クラスを新規作成', action: 'create_class' },
              { label: '既存クラスを選択', action: 'select_class' },
            ],
          },
          created_at: new Date().toISOString(),
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: welcomeMessage });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || '会話の開始に失敗しました' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '会話の開始中にエラーが発生しました' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [authState.teacher]);

  // Load existing conversation
  const loadConversation = useCallback(async (conversationId: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/chat/conversation/${conversationId}`);
      const result: ChatResponse = await response.json();
      
      if (result.success && result.data) {
        if (result.data.conversation) {
          dispatch({ type: 'SET_CONVERSATION', payload: result.data.conversation });
        }
        if (result.data.messages) {
          dispatch({ type: 'UPDATE_MESSAGES', payload: result.data.messages });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || '会話の読み込みに失敗しました' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '会話の読み込み中にエラーが発生しました' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Resume last active conversation (DB に保持している last_conversation_id を利用)
  const resumeLastConversation = useCallback(async () => {
    if (!authState.teacher) return;

    const lastId = authState.teacher.last_conversation_id;

    if (lastId) {
      await loadConversation(lastId);
    } else {
      await startConversation();
    }
  }, [authState.teacher, loadConversation, startConversation]);

  // Send a message
  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!state.conversation) {
      dispatch({ type: 'SET_ERROR', payload: '会話が開始されていません' });
      return;
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      conversation_id: state.conversation.id,
      message_type: 'user',
      content,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      const formData = new FormData();
      formData.append('conversation_id', state.conversation.id.toString());
      formData.append('content', content);
      formData.append('message_type', 'user');
      
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        body: formData,
      });

      const result: ChatResponse = await response.json();
      
      if (result.success && result.data?.messages) {
        dispatch({ type: 'UPDATE_MESSAGES', payload: result.data.messages });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'メッセージの送信に失敗しました' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'メッセージの送信中にエラーが発生しました' });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  }, [state.conversation]);

  // Move to specific step
  const moveToStep = useCallback(async (step: ConversationStep) => {
    if (!state.conversation) return;

    try {
      const response = await fetch(`/api/chat/conversation/${state.conversation.id}/step`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      });

      const result: ChatResponse = await response.json();
      
      if (result.success) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: step });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'ステップの更新に失敗しました' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'ステップの更新中にエラーが発生しました' });
    }
  }, [state.conversation]);

  // Complete current step
  const completeCurrentStep = useCallback(async (stepData?: Record<string, any>) => {
    if (!state.conversation) return;

    try {
      const response = await fetch(`/api/chat/conversation/${state.conversation.id}/complete-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          step: state.currentStep,
          step_data: stepData || {},
        }),
      });

      const result: ChatResponse = await response.json();
      
      if (!result.success) {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'ステップの完了に失敗しました' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'ステップの完了中にエラーが発生しました' });
    }
  }, [state.conversation, state.currentStep]);

  // Start optimization
  const startOptimization = useCallback(async (constraints: any, surveyId?: number) => {
    if (!state.conversation) return;

    try {
      const response = await fetch('/api/chat/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: state.conversation.id,
          constraints,
          survey_id: surveyId,
        }),
      });

      const result: ChatResponse = await response.json();
      
      if (result.success && result.data?.optimization_job) {
        dispatch({ type: 'SET_OPTIMIZATION_JOB', payload: result.data.optimization_job });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || '最適化の開始に失敗しました' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '最適化の開始中にエラーが発生しました' });
    }
  }, [state.conversation]);

  // Utility functions
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetChat = useCallback(() => {
    dispatch({ type: 'RESET_CHAT' });
  }, []);

  // Auto-resume conversation on mount
  useEffect(() => {
    if (authState.teacher && !state.conversation) {
      resumeLastConversation();
    }
  }, [authState.teacher, state.conversation, resumeLastConversation]);

  const contextValue: ChatContextType = {
    state,
    startConversation,
    loadConversation,
    resumeLastConversation,
    sendMessage,
    moveToStep,
    completeCurrentStep,
    startOptimization,
    clearError,
    resetChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use chat context
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;