'use client'

import { Survey, MatchingResultWithTeams } from '@/src/lib/interfaces'
import MatchingResultPanel from './MatchingResultPanel'

interface SurveyResultsContentProps {
    selectedSurvey: Survey | null
    savedMatchingResult: MatchingResultWithTeams | null
    isLoadingResult: boolean
    showSurveyList: boolean
    onToggleSurveyList: () => void
}

export default function SurveyResultsContent({
    selectedSurvey,
    savedMatchingResult,
    isLoadingResult,
    showSurveyList,
    onToggleSurveyList
}: SurveyResultsContentProps) {
    if (!selectedSurvey) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">班分け結果を選択してください</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        左側のリストから班分け結果を選択すると、詳細を確認できます。
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{selectedSurvey.name}</h1>
                        <p className="mt-1 text-sm text-gray-600">クラス: {selectedSurvey.class.name}</p>
                    </div>
                    {/* Mobile: Toggle survey list button */}
                    <button
                        onClick={onToggleSurveyList}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Content Area - Results */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Matching result */}
                {isLoadingResult ? (
                    <div className="p-6 text-center text-gray-600">結果を読み込み中...</div>
                ) : (
                    <MatchingResultPanel matchingResult={savedMatchingResult} />
                )}
            </div>
        </div>
    )
}