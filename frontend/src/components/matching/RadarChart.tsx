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
import { Student } from '@/src/lib/interfaces';

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
    label_students: Student[],
    data: number[],
    color: string
}

export function RadarChart(props: RadarChartProps) {
    return (
        <div className='w-auto'>
            {
                props.label_students.map((student: Student, index: number) => {
                    const textColor: string = student.sex === 0 ? 'text-blue-900' : 'text-pink-500';
                    return <span className={`text-center text-sm font-light ${textColor}`}>[{student.name}]{index == props.label_students.length -1 ? '':'　'}</span>
                })
            }
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
                            },
                        }
                    }
                }}
            />
        </div>
    );
}