'use client';

import React, { useState, useEffect } from 'react';
import { useDrawer } from '@/src/contexts/DrawerContext';
import { useChatContext } from '@/src/contexts/ChatContext';

interface FloatingActionButtonProps {
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toggleDrawer } = useDrawer();
  const { state: chatState } = useChatContext();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on desktop
  if (!isMobile) return null;

  const handleMainAction = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      // Primary action: Open AI Assistant
      toggleDrawer('chat');
    }
  };

  const fabItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'AIアシスタント',
      onClick: () => {
        toggleDrawer('chat');
        setIsExpanded(false);
      },
      primary: true
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
      label: 'クラス管理',
      onClick: () => {
        window.location.href = '/class';
        setIsExpanded(false);
      }
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: '結果履歴',
      onClick: () => {
        window.location.href = '/surveys';
        setIsExpanded(false);
      }
    }
  ];

  const hasNotifications = chatState.isLoading || 
                          chatState.isTyping || 
                          chatState.fileProcessingJobs.some(job => job.status === 'completed');

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* FAB Container */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* Sub-actions */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {fabItems.slice(1).reverse().map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3"
                style={{
                  animation: `fadeInUp 0.2s ease-out ${index * 0.1}s both`
                }}
              >
                <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.label}
                </span>
                <button
                  onClick={item.onClick}
                  className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                >
                  {item.icon}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={handleMainAction}
          onLongPress={() => setIsExpanded(true)}
          className={`w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
            isExpanded ? 'rotate-45 bg-gray-500' : ''
          } ${hasNotifications ? 'animate-pulse ring-4 ring-blue-300 ring-opacity-50' : ''}`}
          aria-label={isExpanded ? 'メニューを閉じる' : 'AIアシスタント'}
        >
          {isExpanded ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}

          {/* Notification Badge */}
          {hasNotifications && !isExpanded && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
              !
            </span>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

// Custom hook for long press detection
const useLongPress = (callback: () => void, delay = 500) => {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const start = () => {
    const timer = setTimeout(callback, delay);
    setPressTimer(timer);
  };

  const stop = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  return {
    onTouchStart: start,
    onTouchEnd: stop,
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop
  };
};

// Add long press support to button
declare module 'react' {
  interface HTMLAttributes<T> {
    onLongPress?: () => void;
  }
}

// Enhanced button component with long press
const ButtonWithLongPress: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onLongPress?: () => void;
}> = ({ onLongPress, children, ...props }) => {
  const longPressProps = useLongPress(onLongPress || (() => {}));

  return (
    <button {...props} {...longPressProps}>
      {children}
    </button>
  );
};

export default FloatingActionButton;