'use client'

import { Survey, Class, MatchingResultWithTeams } from '@/src/lib/interfaces'
import OptimizationHistory from './OptimizationHistory'

interface SurveyListProps {
    surveys: Survey[]
    classes: Class[]
    selectedSurvey: Survey | null
    classFilter: number | 'all'
    isLoadingSurveys: boolean
    matchingResults: MatchingResultWithTeams[]
    selectedMatchingResult: MatchingResultWithTeams | null
    isLoadingResult: boolean
    onSurveySelect: (survey: Survey) => void
    onClassFilterChange: (classFilter: number | 'all') => void
    onSelectMatchingResult: (matchingResult: MatchingResultWithTeams) => void
    /** サイドバーの表示/非表示切り替え */
    onToggleSurveyList: () => void
}

export default function SurveyList({
    surveys,
    classes,
    selectedSurvey,
    classFilter,
    isLoadingSurveys,
    matchingResults,
    selectedMatchingResult,
    isLoadingResult,
    onSurveySelect,
    onClassFilterChange,
    onSelectMatchingResult,
    onToggleSurveyList
}: SurveyListProps) {
    return (
        <div className="w-96 border-r border-gray-200 flex flex-col">
            {/* サイドバー ヘッダー */}
            <div className="p-6 border-b border-gray-200 space-y-4 relative">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">過去の班分け結果</h1>
                    <p className="mt-1 text-sm text-gray-600">班分けを実施したアンケートの結果を確認できます</p>
                </div>

                {/* サイドバー折りたたみボタン */}
                <button
                    onClick={onToggleSurveyList}
                    className="absolute top-0 right-0 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    aria-label="メニューを折りたたむ"
                >
                    <span className="text-lg">＜</span>
                </button>

                {/* クラスフィルタ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="classFilter">クラスで絞り込み</label>
                    <select
                        id="classFilter"
                        value={classFilter}
                        onChange={(e) => {
                            const val = e.target.value
                            onClassFilterChange(val === 'all' ? 'all' : Number(val))
                        }}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="all">すべてのクラス</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Survey List Section */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <div className="space-y-4">
                        {/* Survey List with Team Results */}
                        {isLoadingSurveys ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">班分け結果を読み込み中...</p>
                            </div>
                        ) : surveys.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">班分け結果がありません</h3>
                                <p className="text-gray-500">チャット画面で班分けを実施すると、ここに結果が表示されます。</p>
                            </div>
                        ) : (
                            // クラスフィルタ適用
                            (classFilter === 'all' ? surveys : surveys.filter((s) => s.class.id === classFilter)).map((survey) => (
                                <div
                                    key={survey.id}
                                    className={`p-4 rounded-lg border cursor-pointer transition-colors relative group ${
                                        selectedSurvey?.id === survey.id
                                            ? 'bg-blue-50 border-blue-500'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => onSurveySelect(survey)}
                                >
                                    <h3 className="font-medium">{survey.name}</h3>
                                    <p className="text-sm text-gray-500">クラス: {survey.class.name}</p>
                                    <p className="text-sm text-gray-500">
                                        班分け実施日: {survey.created_at ? new Date(survey.created_at).toLocaleDateString('ja-JP', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        }) : '日付なし'}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-xs text-green-600 font-medium">班分け完了</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Optimization History Section */}
                {selectedSurvey && (
                    <div className="p-4 bg-gray-50">
                        {isLoadingResult ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">履歴を読み込み中...</p>
                            </div>
                        ) : (
                            <OptimizationHistory
                                matchingResults={matchingResults}
                                selectedMatchingResult={selectedMatchingResult}
                                onSelectMatchingResult={onSelectMatchingResult}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}