'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Step } from '../types';
import annotationPlugin from 'chartjs-plugin-annotation';
import { CHART_DIMENSIONS } from '../constants/chart';
import ChartContainer from './ChartContainer';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface LactateChartProps {
  steps: Step[];
  lt1?: Step | null;
  lt2?: Step | null;
}

export default function LactateChart({ steps, lt1, lt2 }: LactateChartProps) {
  // Sort steps by intensity for proper line drawing
  const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);
  
  // Find max lactate step for diagonal line
  const maxLactate = Math.max(...steps.map(s => s.lactate_mmol_l));
  const maxLactateSteps = steps.filter(s => s.lactate_mmol_l === maxLactate);
  const maxStep = maxLactateSteps.reduce((acc, curr) => 
    curr.intensity > acc.intensity ? curr : acc
  );

  const data = {
    datasets: [
      {
        label: 'Lactate (mmol/L)',
        data: sortedSteps.map(s => ({ x: s.intensity, y: s.lactate_mmol_l })),
        borderColor: 'blue',
        backgroundColor: 'blue',
        yAxisID: 'yLactate',
        tension: 0,
        pointStyle: 'circle',
        radius: 4,
        borderWidth: 2
      },
      {
        label: 'Heart Rate (bpm)',
        data: sortedSteps.map(s => ({ x: s.intensity, y: s.heart_rate_bpm })),
        borderColor: 'orange',
        backgroundColor: 'orange',
        yAxisID: 'yHeartRate',
        tension: 0,
        pointStyle: 'rect',
        radius: 4,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      annotation: {
        annotations: {
          ...(lt1 && {
            diagonalLine: {
              type: 'line',
              xMin: lt1.intensity,
              yMin: lt1.lactate_mmol_l,
              xMax: maxStep.intensity,
              yMax: maxStep.lactate_mmol_l,
              borderColor: 'lightgrey',
              borderWidth: 2,
              borderDash: [3, 3],
              yScaleID: 'yLactate',
              z: -1
            },
            lt1Line: {
              type: 'line',
              xMin: lt1.intensity,
              xMax: lt1.intensity,
              borderColor: 'rgba(255, 99, 132, 0.7)',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: true,
                content: 'LT1',
                position: 'start'
              },
              z: 1
            }
          }),
          ...(lt2 && {
            lt2Line: {
              type: 'line',
              xMin: lt2.intensity,
              xMax: lt2.intensity,
              borderColor: 'rgba(255, 205, 86, 0.7)',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: true,
                content: 'LT2',
                position: 'start'
              },
              z: 1
            }
          })
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Intensity'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      yLactate: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Lactate (mmol/L)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      yHeartRate: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Heart Rate (bpm)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <ChartContainer>
      <Line 
        data={data} 
        options={options}
        style={{ height: '100%' }}
      />
    </ChartContainer>
  );
} 