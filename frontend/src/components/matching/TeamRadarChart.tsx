'use client';

import React from 'react';
import { RadarChart } from '@/src/components/matching/RadarChart';

export interface TeamRadarChartProps {
  /** チーム名 */
  teamName: string;
  /** チーム合計スコア（8領域） */
  aggregatedScores: number[];
  /** メインカラー（"R,G,B" 形式） */
  color: string;
  /** オーバーレイ用スコア（個人など） */
  overlayScores?: number[];
  /** オーバーレイ用カラー */
  overlayColor?: string;
  /** オーバーレイラベル */
  overlayLabel?: string;
  /** 苦手生徒テーブルなど追加情報 */
  studentDislikeTable?: React.ReactNode;
}

export const TeamRadarChart: React.FC<TeamRadarChartProps> = ({
  teamName,
  aggregatedScores,
  color,
  overlayScores,
  overlayColor,
  overlayLabel = '個人のスコア',
  studentDislikeTable,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">{teamName}</h3>
      <div className="pt-4 relative">
        <RadarChart
          label="チームのスコア"
          data={aggregatedScores}
          color={color}
          overlayData={overlayScores}
          overlayColor={overlayColor}
          overlayLabel={overlayLabel}
        />
      </div>
      {studentDislikeTable && <div className="mt-4">{studentDislikeTable}</div>}
    </div>
  );
};

export default TeamRadarChart;
