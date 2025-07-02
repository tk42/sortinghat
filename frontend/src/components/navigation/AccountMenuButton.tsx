'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/src/utils/firebase/authprovider';
import { useChatContext } from '@/src/contexts/ChatContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/utils/firebase/firebase';
import { Fragment } from 'react';
import MenuItem from './MenuItem';

interface AccountMenuButtonProps {
  fixed?: boolean;
}

const AccountMenuButton: React.FC<AccountMenuButtonProps> = ({ fixed = true }) => {
  const router = useRouter();
  const { state: authState } = useAuthContext();
  const { resetChat } = useChatContext();
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear chat session before logout
      resetChat();
      
      // Clear all session storage related to chat
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('chat-scroll-') || key.startsWith('conversation-')) {
          sessionStorage.removeItem(key);
        }
      });

      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleAccountSettings = () => {
    // Save current scroll position before navigation
    if (window.location.pathname === '/dashboard') {
      const chatContainer = document.querySelector('[data-chat-container]');
      if (chatContainer) {
        sessionStorage.setItem('dashboard-scroll-position', chatContainer.scrollTop.toString());
      }
    }
    router.push('/settings');
  };

  const handleSurveyHistory = () => {
    // Save current scroll position before navigation
    if (window.location.pathname === '/dashboard') {
      const chatContainer = document.querySelector('[data-chat-container]');
      if (chatContainer) {
        sessionStorage.setItem('dashboard-scroll-position', chatContainer.scrollTop.toString());
      }
    }
    router.push('/surveys');
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z" />
        </svg>
      ),
      label: 'ダッシュボード',
      onClick: handleDashboard
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: '班分け計算結果',
      onClick: handleSurveyHistory
    }
  ];

  const avatarContent = (
    <div className="relative">
      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:ring-4 hover:ring-blue-200 hover:ring-opacity-50 cursor-pointer group">
        <span className="text-white font-medium text-lg group-hover:scale-110 transition-transform">
          {authState.teacher?.name?.charAt(0) || 'U'}
        </span>
      </div>
    </div>
  );

  // Desktop Menu (Headless UI Menu)
  const DesktopMenu = () => (
    <Menu as="div" className="relative">
      <Menu.Button
        data-tooltip="account-menu"
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        {avatarContent}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute top-full right-0 mt-2 w-64 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 cursor-pointer" onClick={handleAccountSettings}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {authState.teacher?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {authState.teacher?.name || 'ユーザー'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {authState.teacher?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <MenuItem
                    icon={item.icon}
                    label={item.label}
                    onClick={item.onClick}
                    active={active}
                  />
                )}
              </Menu.Item>
            ))}

            <div className="border-t border-gray-100 my-1" />

            <Menu.Item>
              {({ active }) => (
                <MenuItem
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  }
                  label="ログアウト"
                  onClick={handleLogout}
                  danger
                  active={active}
                />
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );

  // Mobile Bottom Sheet
  const MobileBottomSheet = () => (
    <>
      <button
        data-tooltip="account-menu"
        onClick={() => setIsBottomSheetOpen(true)}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        {avatarContent}
      </button>

      <Transition appear show={isBottomSheetOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsBottomSheetOpen}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          {/* Bottom Sheet */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-full"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-full"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-2xl bg-white shadow-xl transition-all">
                  {/* Handle bar */}
                  <div className="flex justify-center pt-4 pb-2">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                  </div>

                  {/* User Info */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {authState.teacher?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium text-gray-900 truncate">
                          {authState.teacher?.name || 'ユーザー'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {authState.teacher?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="px-0 py-2">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setIsBottomSheetOpen(false);
                        }}
                        className="w-full px-6 py-4 text-left flex items-center space-x-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-gray-500">{item.icon}</div>
                        <span className="text-gray-900 font-medium">{item.label}</span>
                      </button>
                    ))}

                    <div className="border-t border-gray-100 my-2" />

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsBottomSheetOpen(false);
                      }}
                      className="w-full px-6 py-4 text-left flex items-center space-x-4 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-red-600 font-medium">ログアウト</span>
                    </button>
                  </div>

                  {/* Safe area for mobile */}
                  <div className="h-safe-area-inset-bottom" />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );

  return (
    <div
      className={`${fixed ? `fixed z-40 ${isMobile ? 'bottom-5 right-5' : 'top-5 right-5'}` : 'relative z-40'}`}
    >
      {isMobile ? <MobileBottomSheet /> : <DesktopMenu />}
    </div>
  );
};

export default AccountMenuButton;