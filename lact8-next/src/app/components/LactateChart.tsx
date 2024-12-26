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
  // Prepare data for the chart
  const data = {
    labels: steps.map(step => step.intensity.toString()),
    datasets: [
      {
        label: 'Lactate',
        data: steps.map(step => step.lactate_mmol_l),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Lactate Curve',
      },
      annotation: {
        annotations: {
          lt1Line: lt1 ? {
            type: 'line',
            xMin: lt1.intensity,
            xMax: lt1.intensity,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 2,
            label: {
              display: true,
              content: 'LT1',
              position: 'start'
            }
          } : undefined,
          lt2Line: lt2 ? {
            type: 'line',
            xMin: lt2.intensity,
            xMax: lt2.intensity,
            borderColor: 'rgba(255, 206, 86, 0.5)',
            borderWidth: 2,
            label: {
              display: true,
              content: 'LT2',
              position: 'start'
            }
          } : undefined,
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Intensity'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Lactate (mmol/L)'
        }
      }
    }
  };

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
} 