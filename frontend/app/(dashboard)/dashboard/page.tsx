import ChatWindow from '@/src/components/chat/ChatWindow'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - SynergyMatchMaker',
  description: 'AI-powered class grouping assistant',
}

export default async function Page() {
  return (
    <>
      <ChatWindow />
    </>
  );
}