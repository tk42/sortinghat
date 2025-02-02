"use client"

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { IdentificationIcon, ChartBarIcon, AcademicCapIcon, HomeModernIcon } from '@heroicons/react/24/outline'; // @heroicons/react のアイコンを使用
import { NavigationItem } from './NavigationItem';

export const Sidebar = () => {
    const isSidebarOpen = useState();

    const pathname = usePathname(); // 現在のルートを取得
    const noSidebarRoutes = ["/", "/error", "/login", "/privacy-policy", "/specified-commercial-transaction-act", "/terms-of-services"]; // サイドバーを非表示にしたいパスを指定

    // 現在のルートがサイドバー非表示ルートに含まれているかどうかを判定
    const showSidebar = !noSidebarRoutes.some(route => pathname === route);

    if (!showSidebar) {
        return <></>;
    }

    return (
        <>
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
                <NavigationItem icon={AcademicCapIcon} href={'/dashboard'} name={'担任クラス'} />
                <NavigationItem icon={ChartBarIcon} href={'/matching'} name={'マッチング'} />
                <NavigationItem icon={IdentificationIcon} href={'/account'} name={'アカウント'} />
                <div className="flex-grow"></div>
                <NavigationItem icon={HomeModernIcon} href={'/'} name={'ホーム'} />
            </nav>
        </>
    );
};