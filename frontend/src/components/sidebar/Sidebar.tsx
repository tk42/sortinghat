"use client"

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { IdentificationIcon, PencilSquareIcon, ChartPieIcon, AcademicCapIcon, HomeModernIcon } from '@heroicons/react/24/outline'; // @heroicons/react のアイコンを使用
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
                <NavigationItem icon={AcademicCapIcon} href={'/dashboard'} name={'担任クラス'} matchingDrawer={false} />
                <NavigationItem icon={PencilSquareIcon} href={'/surveys'} name={'アンケート'} matchingDrawer={true} />
                <NavigationItem icon={ChartPieIcon} href={'/matching'} name={'マッチング'} matchingDrawer={false} />
                <NavigationItem icon={IdentificationIcon} href={'/account'} name={'アカウント'} matchingDrawer={false} />
                <div className="flex-grow"></div>
                <NavigationItem icon={HomeModernIcon} href={'/'} name={'ホーム'} matchingDrawer={false} />
            </nav>
        </>
    );
};