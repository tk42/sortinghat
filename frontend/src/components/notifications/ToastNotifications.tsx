'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (toast.duration !== 0) { // 0 means persist until manually closed
      const duration = toast.duration || 5000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-white border-green-200 text-green-800';
      case 'error':
        return 'bg-white border-red-200 text-red-800';
      case 'warning':
        return 'bg-white border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-white border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-sm w-full pointer-events-auto border rounded-lg shadow-lg p-4 transition-all duration-300 transform ${getToastStyles(toast.type)}`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getToastIcon(toast.type)}
            </div>
            
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-1 text-sm opacity-90">
                  {toast.message}
                </p>
              )}
              
              {toast.action && (
                <div className="mt-2">
                  <button
                    onClick={toast.action.onClick}
                    className="text-sm font-medium underline hover:no-underline"
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => removeToast(toast.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Predefined toast helpers
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string, action?: Toast['action']) => 
      addToast({ type: 'success', title, message: message || '', action }),
    
    error: (title: string, message?: string, action?: Toast['action']) => 
      addToast({ type: 'error', title, message: message || '', action }),
    
    warning: (title: string, message?: string, action?: Toast['action']) => 
      addToast({ type: 'warning', title, message: message || '', action }),
    
    info: (title: string, message?: string, action?: Toast['action']) => 
      addToast({ type: 'info', title, message: message || '', action }),
    
    fileProcessingComplete: (fileName: string) => 
      addToast({
        type: 'success',
        title: 'ファイル処理完了',
        message: `「${fileName}」の処理が完了しました`,
        action: {
          label: 'チャットで確認',
          onClick: () => {
            // Open chat if not already open
            const chatButton = document.querySelector('[data-tooltip="ai-assistant"]') as HTMLElement;
            chatButton?.click();
          }
        }
      }),
    
    optimizationComplete: (teamCount: number) => 
      addToast({
        type: 'success',
        title: '最適化完了',
        message: `${teamCount}チームの班分けが完了しました`,
        action: {
          label: '結果を確認',
          onClick: () => {
            // Navigate to results
          }
        }
      }),
    
    suggestionToast: (message: string, actionLabel: string, actionCallback: () => void) =>
      addToast({
        type: 'info',
        title: '提案',
        message,
        duration: 8000,
        action: {
          label: actionLabel,
          onClick: actionCallback
        }
      })
  };
};