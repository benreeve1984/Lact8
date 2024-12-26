'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Scatter } from 'react-chartjs-2';
import { Step } from '../types';

// Register required Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ScatterController,
  annotationPlugin
);

interface ChartContainerProps {
  steps: Step[];
  lt1: Step | null;
  lt2: Step | null;
}

// Define chart theme configuration
const CHART_THEME = {
  colors: {
    lactate: {
      main: 'rgb(59, 130, 246)', // Tailwind blue-500
      light: 'rgba(59, 130, 246, 0.5)'
    },
    heartRate: {
      main: 'rgb(249, 115, 22)', // Tailwind orange-500
      light: 'rgba(249, 115, 22, 0.5)'
    },
    thresholds: {
      lt1: {
        main: 'rgb(244, 63, 94)', // Tailwind rose-500
        light: 'rgba(244, 63, 94, 0.5)'
      },
      lt2: {
        main: 'rgb(245, 158, 11)', // Tailwind amber-500
        light: 'rgba(245, 158, 11, 0.5)'
      },
      reference: {
        main: 'rgb(209, 213, 219)', // Tailwind gray-300
        light: 'rgba(209, 213, 219, 0.5)'
      }
    }
  },
  fonts: {
    base: 'system-ui, -apple-system, sans-serif'
  }
} as const;

export default function ChartContainer({ steps, lt1, lt2 }: ChartContainerProps) {
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  // Helper function to get annotations configuration
  const getAnnotations = (steps: Step[], lt1: Step | null, lt2: Step | null) => {
    if (steps.length === 0) return {};

    const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);
    const maxLactateValue = Math.max(...sortedSteps.map(s => s.lactate_mmol_l)) * 1.2;
    const maxLactateStep = sortedSteps.reduce((max, step) => 
      step.lactate_mmol_l > max.lactate_mmol_l ? step : max
    );

    // Helper function to create vertical line annotation
    const createVerticalLine = (step: Step, label: string) => ({
      type: 'line',
      xMin: step.intensity,
      xMax: step.intensity,
      yMin: 0,
      yMax: maxLactateValue,
      borderColor: 'rgba(0, 0, 0, 0.5)', // Black with 50% opacity
      borderWidth: 1,
      borderDash: [5, 5], // Creates dotted line
      yScaleID: 'yLactate',
      label: {
        display: true,
        content: label,
        position: 'end',
        yAdjust: -5,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent dark background
        color: 'white', // White text
        padding: { x: 6, y: 4 }, // Padding around text
        font: {
          size: 12,
          family: CHART_THEME.fonts.base,
          weight: 'bold'
        },
        borderRadius: 4 // Rounded corners
      }
    });

    return {
      ...(lt1 && {
        lt1Line: createVerticalLine(lt1, 'LT1'),
        diagonalLine: {
          type: 'line',
          xMin: lt1.intensity,
          yMin: lt1.lactate_mmol_l,
          xMax: maxLactateStep.intensity,
          yMax: maxLactateStep.lactate_mmol_l,
          borderColor: 'rgba(0, 0, 0, 0.3)', // Light black for diagonal line
          borderWidth: 1,
          borderDash: [5, 5],
          yScaleID: 'yLactate',
          display: true // Ensure the line is displayed
        }
      }),
      ...(lt2 && {
        lt2Line: createVerticalLine(lt2, 'LT2')
      })
    };
  };

  // Create chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 5,
        bottom: 5,
        left: 5
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Intensity',
          padding: { top: 5 },
          font: {
            weight: '600'
          }
        },
        ticks: {
          padding: 2
        }
      },
      yLactate: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Lactate (mmol/L)',
          padding: { bottom: 5 },
          font: {
            weight: '600'
          }
        },
        beginAtZero: true,
        suggestedMax: Math.max(...steps.map(s => s.lactate_mmol_l)) * 1.2,
        ticks: {
          padding: 2
        }
      },
      yHeartRate: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Heart Rate (bpm)',
          padding: { bottom: 5 },
          font: {
            weight: '600'
          }
        },
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          padding: 2
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          padding: 10,
          font: {
            size: 11,
            family: CHART_THEME.fonts.base
          },
          usePointStyle: true,
          pointStyle: true
        }
      },
      annotation: {
        annotations: getAnnotations(steps, lt1, lt2)
      }
    }
  };

  // Prepare chart data
  const chartData = {
    datasets: [
      {
        label: 'Lactate',
        data: steps.map(step => ({
          x: step.intensity,
          y: step.lactate_mmol_l
        })),
        borderColor: CHART_THEME.colors.lactate.main,
        backgroundColor: CHART_THEME.colors.lactate.main,
        yAxisID: 'yLactate',
        showLine: true,
        tension: 0,
        pointStyle: 'circle'
      },
      {
        label: 'Heart Rate',
        data: steps.map(step => ({
          x: step.intensity,
          y: step.heart_rate_bpm
        })),
        borderColor: CHART_THEME.colors.heartRate.main,
        backgroundColor: CHART_THEME.colors.heartRate.main,
        yAxisID: 'yHeartRate',
        showLine: true,
        tension: 0,
        pointStyle: 'rect'
      }
    ]
  };

  return (
    <div className="w-full aspect-[2/1] min-h-[300px]">
      <Scatter 
        ref={chartRef}
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
} 