'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/src/utils/firebase/authprovider'
import { fetchMatchingResult } from '@/src/utils/actions/fetch_matching_result'
import { fetchClasses } from '@/src/utils/actions/fetch_classes'
import { deleteMatchingResult } from '@/src/utils/actions/delete_matching_result'
import { Class, MatchingResult, MatchingResultWithTeams } from '@/src/lib/interfaces'
// import MatchingList from './MatchingList' // Removed - now inline
// import { useDrawer } from '@/src/contexts/DrawerContext' // Removed with sidebar
import { MatchingOverview } from './MatchingOverview'
import UserAvatarButton from '@/src/components/navigation/UserAvatarButton'

interface MatchingPageClientProps {
    initialMatchingResults: MatchingResultWithTeams[]
    initialClasses: Class[]
}

export default function MatchingPageClient({ initialMatchingResults, initialClasses }: MatchingPageClientProps) {
    const { state } = useAuthContext()
    const [matchingResults, setMatchingResults] = useState<MatchingResultWithTeams[]>(initialMatchingResults)
    const [selectedMatching, setSelectedMatching] = useState<MatchingResult | null>(null)
    const [classes, setClasses] = useState<Class[]>(initialClasses)
    const [showMatchingList, setShowMatchingList] = useState(true)

    useEffect(() => {
        const loadTeacherData = async () => {
            try {
                if (state.user?.uid) {
                    const [teacherMatchingResults, teacherClasses] = await Promise.all([
                        fetchMatchingResult(state.user.uid),
                        fetchClasses(state.user.uid)
                    ])
                    setMatchingResults(teacherMatchingResults)
                    setClasses(teacherClasses)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            }
        }

        loadTeacherData()
    }, [state.user])

    async function handleDeleteMatching(matchingId: string) {
        try {
            await deleteMatchingResult(parseInt(matchingId))
            // Update local state after successful deletion
            setMatchingResults(prevResults => 
                prevResults.filter(matching => matching.id.toString() !== matchingId)
            )
            // Reset selected matching if it was the one that was deleted
            if (selectedMatching?.id.toString() === matchingId) {
                setSelectedMatching(null)
            }
        } catch (error) {
            console.error('Failed to delete matching:', error)
            // You might want to show an error notification to the user here
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Side margins for consistency with ChatWindow */}
            <div className="hidden lg:block flex-1 max-w-xs" />
            
            {/* Main content area */}
            <div className="w-full max-w-[80%] mx-auto flex bg-white shadow-lg">
                {/* Matching List - Left Panel */}
                {showMatchingList && (
                    <div className="w-96 border-r border-gray-200 flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <h1 className="text-2xl font-semibold text-gray-900">マッチング結果一覧</h1>
                            <p className="mt-1 text-sm text-gray-600">過去の班分け結果を確認できます</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {/* Matching Results List */}
                                {matchingResults.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">マッチング結果がありません</h3>
                                        <p className="text-gray-500">まずはアンケートから班分けを実行してください。</p>
                                    </div>
                                ) : (
                                    matchingResults.map((matching) => (
                                        <div
                                            key={matching.id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-colors relative group ${
                                                selectedMatching?.id === matching.id
                                                    ? 'bg-blue-50 border-blue-500'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                            onClick={() => setSelectedMatching(matching)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">
                                                        {matching.survey?.class?.name || '不明なクラス'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {matching.survey?.name || '不明なアンケート'}
                                                    </p>
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <span className="text-gray-300">•</span>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(matching.created_at).toLocaleDateString('ja-JP', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteMatching(matching.id.toString())
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 rounded"
                                                    title="削除"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {selectedMatching ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-gray-900">
                                            {selectedMatching.survey?.class?.name || '不明なクラス'}
                                        </h1>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {selectedMatching.survey?.name || '不明なアンケート'} - 班分け結果
                                        </p>
                                    </div>
                                    {/* Mobile: Toggle matching list button */}
                                    <button
                                        onClick={() => setShowMatchingList(!showMatchingList)}
                                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Matching Overview */}
                            <div className="flex-1 overflow-y-auto">
                                <MatchingOverview selectedMatching={selectedMatching} />
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">マッチング結果を選択してください</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    左側のリストからマッチング結果を選択すると、詳細を確認できます。
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Side margins for consistency with ChatWindow */}
            <div className="hidden lg:block flex-1 max-w-xs" />

            {/* User Avatar Button */}
            <UserAvatarButton />
        </div>
    )
}
