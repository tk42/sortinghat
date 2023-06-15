import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Container as Sidebar } from 'components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            // The user is not authenticated, handle it here.
            router.push('/signin')
        }
    })
    const [sidebarOpen, setSidebarOpen] = useState(false)

    if (status == "loading") {
        return (
            <div className="flex h-screen">
                <div className="m-auto text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
                </div>
            </div>
        )
    }

    if (!session) {
        router.replace('/signin')
        return
    }

    return (
        <>
            <div className='h-full bg-white'>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                {children}
            </div>
        </>
    )
}
