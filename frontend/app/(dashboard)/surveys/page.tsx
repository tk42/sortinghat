import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import SurveysPageClient from '@/src/components/survey/SurveysPageClient'
import { fetchSurveys } from '@/src/utils/actions/fetch_surveys'
import { Toaster } from 'react-hot-toast'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Surveys - SynergyMatchMaker',
    description: 'Your survey matching dashboard',
}

export default async function Page() {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value
    const decodedToken = await auth.verifySessionCookie(sessionCookie!)
    const surveys = await fetchSurveys(decodedToken.uid)

    return (
        <>
            <main className="py-10">
                <div className="max-w-7xl mx-auto">
                    <SurveysPageClient initialSurveys={surveys || []} />
                </div>
                <Toaster />
            </main>
        </>
    )
}