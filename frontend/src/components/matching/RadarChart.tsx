import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export type RadarChartProps = {
    /** メインデータのラベル */
    label: string;
    /** メインデータの数値配列 */
    data: number[];
    /** メインデータの色 */
    color: string;
    /** オーバーレイ用データ配列 */
    overlayData?: number[];
    /** オーバーレイ用色 */
    overlayColor?: string;
    /** オーバーレイ用ラベル */
    overlayLabel?: string;
}

export function RadarChart({ label, data, color, overlayData, overlayColor, overlayLabel }: RadarChartProps) {
    // メインデータセット
    const baseSet = { label, data, backgroundColor: `rgba(${color},0.2)`, borderColor: `rgba(${color},1)`, borderWidth: 1 };
    // オーバーレイデータセット
    const overlaySet = overlayData
        ? { label: overlayLabel || '', data: overlayData, backgroundColor: 'transparent', borderColor: overlayColor ? `rgba(${overlayColor},1)` : 'rgba(0,0,0,0.5)', borderWidth: 2 }
        : null;
    const datasets = overlaySet ? [baseSet, overlaySet] : [baseSet];
    return (
        <div className='w-full h-64'>
            <Radar
                data={{ labels: ['身体','空間','論理','言語','対人','内省','音楽','自然'], datasets }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { r: { beginAtZero: true, ticks: { stepSize: 5 }, pointLabels: { display: true } } },
                    plugins: { legend: { display: false } },
                }}
            />
        </div>
    );
}