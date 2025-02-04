import { cookies } from 'next/headers'
import DashboardClient from '@/src/components/dashboard/DashboardClient'
import { auth } from '@/src/utils/firebase/admin'
import { Metadata } from 'next'
import { fetchClasses } from '@/src/utils/actions/fetch_classes'

export const metadata: Metadata = {
  title: 'Dashboard - SynergyMatchMaker',
  description: 'Your class management dashboard',
}

export default async function Page() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value
  const decodedToken = await auth.verifySessionCookie(sessionCookie!)
  const classes = await fetchClasses(decodedToken.uid)
  
  return (
    <main className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <DashboardClient initialClasses={classes} />
      </div>
    </main>
  )
}