// 新規コンポーネント: MatchingResultPanel
'use client'

import React from 'react'
import { MatchingResultWithTeams } from '@/src/lib/interfaces'
import ResultConfirmationPhase from '@/src/components/chat/phases/ResultConfirmationPhase'

interface MatchingResultPanelProps {
    matchingResult: MatchingResultWithTeams | null
}

/**
 * MatchingResultPanel
 * ResultConfirmationPhase をそのまま利用しつつ、
 * SurveysPageClient の右側ペインに収まるようラッパーで幅を制限する。
 */
const MatchingResultPanel: React.FC<MatchingResultPanelProps> = ({ matchingResult }) => {
    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {/* ResultConfirmationPhase 自体は内部でグリッド表示を持つため、ラップのみ */}
            <ResultConfirmationPhase matchingResult={matchingResult} />
        </div>
    )
}

export default MatchingResultPanel
