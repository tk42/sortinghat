import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { Metadata } from 'next'
import { fetchMatchingResult } from '@/src/utils/actions/fetch_matching_result'
import MatchingPageClient from '@/src/components/matching/MatchingPageClient'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
    title: 'Matching - SynergyMatchMaker',
    description: 'Your team matching dashboard',
}

export default async function Page() {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value
    const decodedToken = await auth.verifySessionCookie(sessionCookie!)
    const matchingResults = await fetchMatchingResult(decodedToken.uid)

    return (
        <>
            <main className="py-10">
                <div className="max-w-7xl mx-auto">
                    <MatchingPageClient initialMatchingResults={matchingResults || []} />
                </div>
                <Toaster />
            </main>
        </>
    )
}