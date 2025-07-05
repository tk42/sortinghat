'use client'

import { MatchingResultWithTeams } from '@/src/lib/interfaces'

interface OptimizationHistoryProps {
    matchingResults: MatchingResultWithTeams[]
    selectedMatchingResult: MatchingResultWithTeams | null
    onSelectMatchingResult: (matchingResult: MatchingResultWithTeams) => void
}

export default function OptimizationHistory({
    matchingResults,
    selectedMatchingResult,
    onSelectMatchingResult
}: OptimizationHistoryProps) {
    if (matchingResults.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">最適化履歴がありません</h3>
                <p className="text-gray-500">チャット画面で班分けを実施すると、ここに履歴が表示されます。</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">最適化履歴</h3>
            {matchingResults.map((result, index) => (
                <div
                    key={result.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMatchingResult?.id === result.id
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectMatchingResult(result)}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                    {(() => {
                                        if (index === 0) return '最新'
                                        if (index === 1) return '前回'
                                        return `${index}回前`
                                    })()}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {result.name}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                {new Date(result.created_at).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                            {result.constraints_json && (
                                <div className="mt-2">
                                    <span className="text-xs text-gray-500">制約条件:</span>
                                    <div className="mt-1 text-xs text-gray-600">
                                        {(() => {
                                            try {
                                                const constraints = JSON.parse(result.constraints_json)
                                                const constraintLabels = []
                                                if (constraints.members_per_team) constraintLabels.push(`${constraints.members_per_team}人班`)
                                                if (constraints.at_least_one_pair_sex) constraintLabels.push('男女ペア必須')
                                                if (constraints.at_least_one_leader) constraintLabels.push('リーダー必須')
                                                if (constraints.unique_previous) constraintLabels.push('過去班回避')
                                                return constraintLabels.join(', ') || '制約なし'
                                            } catch {
                                                return '制約情報なし'
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                {result.teams.length}班
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}