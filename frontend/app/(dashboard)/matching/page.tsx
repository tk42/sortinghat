import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { Metadata } from 'next'
import { fetchMatchingResult } from '@/src/utils/actions/fetch_matching_result'
import MatchingPageClient from '@/src/components/matching/MatchingPageClient'
import { Toaster } from 'react-hot-toast'
import { MatchingResultWithTeams } from '@/src/lib/interfaces'
import { fetchClasses } from '@/src/utils/actions/fetch_classes'
import { Class } from '@/src/lib/interfaces'

export const metadata: Metadata = {
    title: 'Matching - SynergyMatchMaker',
    description: 'Your team matching dashboard',
}

export default async function Page() {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value
    const decodedToken = await auth.verifySessionCookie(sessionCookie!)
    const matchingResults: MatchingResultWithTeams[] = await fetchMatchingResult(decodedToken.uid)
    const classes: Class[] = await fetchClasses(decodedToken.uid)

    return (
        <>
            <main className="py-10">
                <div className="max-w-7xl mx-auto">
                    <MatchingPageClient initialMatchingResults={matchingResults || []} initialClasses={classes || []} />
                </div>
                <Toaster />
            </main>
        </>
    )
}