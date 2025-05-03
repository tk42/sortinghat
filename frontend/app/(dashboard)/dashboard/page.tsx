import DashboardClient from '@/src/components/dashboard/DashboardClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - SynergyMatchMaker',
  description: 'Your class management dashboard',
}

export default async function Page() {
  return (
    <main className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <DashboardClient />
      </div>
    </main>
  )
}