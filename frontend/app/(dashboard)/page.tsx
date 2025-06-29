import { redirect } from 'next/navigation'

export default function DashboardRoot() {
  // Redirect root dashboard to the specific dashboard page
  redirect('/dashboard/dashboard')
}