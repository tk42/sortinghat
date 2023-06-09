import React, { useState } from 'react';
import { Container as Sidebar } from 'components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <>
            <div className='h-full bg-gray-50'>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                {children}
            </div>
        </>
    )
}
