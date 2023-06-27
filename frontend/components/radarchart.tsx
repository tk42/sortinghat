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

export function RadarChart(props: { label: string, data: number[], color: string }) {
    return (
        <div className='w-auto'>
            <Radar
                data={{
                    labels: ['Score A', 'Score B', 'Score C', 'Score D', 'Score E', 'Score F', 'Score G', 'Score H'],
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
                            }
                        }
                    }
                }}
            />
        </div>
    );
}