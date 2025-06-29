"use client"

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { IdentificationIcon, PencilSquareIcon, ChartPieIcon, AcademicCapIcon, HomeModernIcon, CursorArrowRaysIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; // @heroicons/react のアイコンを使用
import { NavigationItem } from './NavigationItem';
import { useDrawer } from '@/src/contexts/DrawerContext';
import { useChatContext } from '@/src/contexts/ChatContext';
import AccountMenu from '@/src/components/navigation/AccountMenu';
import FirstLoginTooltips from '@/src/components/onboarding/FirstLoginTooltips';

export const Sidebar = () => {
    const isSidebarOpen = useState();
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountButtonRef = useRef<HTMLButtonElement>(null);

    const pathname = usePathname(); // 現在のルートを取得
    const noSidebarRoutes = ["/", "/error", "/login", "/privacy-policy", "/specified-commercial-transaction-act", "/terms-of-services"]; // サイドバーを非表示にしたいパスを指定

    const { toggleDrawer } = useDrawer();
    const { state: chatState } = useChatContext();

    const handleDoNothing = () => {}
    const handleMatchingClick = () => toggleDrawer('matching')
    const handleSurveyClick = () => toggleDrawer('survey')
    const handleChatClick = () => toggleDrawer('chat')
    const handleAccountClick = () => setIsAccountMenuOpen(!isAccountMenuOpen)

    // 現在のルートがサイドバー非表示ルートに含まれているかどうかを判定
    const showSidebar = !noSidebarRoutes.some(route => pathname === route);

    if (!showSidebar) {
        return <></>;
    }

    // Get notification counts for badges
    const getChatBadgeCount = () => {
        if (chatState.isLoading || chatState.isTyping) return 1;
        if (chatState.fileProcessingJobs.some(job => job.status === 'completed' && job.processing_type === 'llm_conversion')) return 1;
        return 0;
    };

    return (
        <>
            <FirstLoginTooltips />
            
            <nav
                className={`${isSidebarOpen ? '' : 'ml-minus-256'
                    } w-72 p-10 duration-300 flex flex-col h-screen fixed left-0 z-10 bg-white`}
            >
                <div className="flex justify-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={256}
                        height={256}
                        priority
                        style={{
                            width: '180px',
                            height: 'auto'
                        }}
                    />
                </div>
                
                <NavigationItem 
                    icon={CursorArrowRaysIcon} 
                    href={'/dashboard'} 
                    name={'使い方'} 
                    handleClick={handleDoNothing}
                    tooltipId="dashboard-guide"
                />
                
                <NavigationItem 
                    icon={ChatBubbleLeftRightIcon} 
                    href={'#'} 
                    name={'AIアシスタント'} 
                    handleClick={handleChatClick}
                    tooltipId="ai-assistant"
                    badgeCount={getChatBadgeCount()}
                    highlight={chatState.isLoading || chatState.isTyping}
                />
                
                <NavigationItem 
                    icon={AcademicCapIcon} 
                    href={'/class'} 
                    name={'担任クラス'} 
                    handleClick={handleDoNothing}
                    tooltipId="class-management"
                />
                
                <NavigationItem 
                    icon={PencilSquareIcon} 
                    href={'/surveys'} 
                    name={'アンケート'} 
                    handleClick={handleSurveyClick}
                    tooltipId="survey-results"
                />
                
                <NavigationItem 
                    icon={ChartPieIcon} 
                    href={'/matching'} 
                    name={'マッチング'} 
                    handleClick={handleMatchingClick}
                    tooltipId="matching-results"
                />
                
                <div className="flex-grow"></div>
                
                {/* Account Menu Button */}
                <button
                    ref={accountButtonRef}
                    onClick={handleAccountClick}
                    data-tooltip="account-menu"
                    className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group"
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="menu"
                    id="account-menu-button"
                >
                    <IdentificationIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">アカウント</span>
                    <svg 
                        className={`w-4 h-4 ml-auto transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                <NavigationItem 
                    icon={HomeModernIcon} 
                    href={'/'} 
                    name={'ホーム'} 
                    handleClick={handleDoNothing}
                />
            </nav>

            <AccountMenu
                isOpen={isAccountMenuOpen}
                onClose={() => setIsAccountMenuOpen(false)}
                anchorEl={accountButtonRef.current}
            />
        </>
    );
};