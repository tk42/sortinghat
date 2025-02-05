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
    label: string,
    label_students: { name: string; sex: number }[],
    data: number[],
    color: string
}

export function RadarChart(props: RadarChartProps) {
    return (
        <div className='w-auto'>
            <Radar
                data={{
                    labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
                    datasets: [
                        {
                            label: props.label,
                            data: props.data,
                            backgroundColor: `rgba(${props.color}, 0.2)`,
                            borderColor: `rgba(${props.color}, 1)`,
                            borderWidth: 1,
                        },
                    ],
                }}
                options={{
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 5
                            },
                            pointLabels: {
                                display: false,
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                    }
                }}
            />
        </div>
    );
}