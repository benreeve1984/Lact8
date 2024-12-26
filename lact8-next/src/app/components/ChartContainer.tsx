'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Step } from '../types';

Chart.register(...registerables, annotationPlugin);

interface ChartContainerProps {
  steps: Step[];
  lt1: Step | null;
  lt2: Step | null;
}

export default function ChartContainer({ steps, lt1, lt2 }: ChartContainerProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Lactate (mmol/L)',
            data: sortedSteps.map(step => ({
              x: step.intensity,
              y: step.lactate_mmol_l
            })),
            borderColor: 'rgb(59, 130, 246)', // blue
            backgroundColor: 'rgb(59, 130, 246)',
            yAxisID: 'yLactate',
            showLine: true,
            tension: 0,
            pointStyle: 'circle'
          },
          {
            label: 'Heart Rate (bpm)',
            data: sortedSteps.map(step => ({
              x: step.intensity,
              y: step.heart_rate_bpm
            })),
            borderColor: 'rgb(249, 115, 22)', // orange
            backgroundColor: 'rgb(249, 115, 22)',
            yAxisID: 'yHeartRate',
            showLine: true,
            tension: 0,
            pointStyle: 'rect'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 0
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Intensity',
              padding: { top: 5 },
              font: {
                size: 14,
                family: 'system-ui'
              }
            },
            ticks: {
              padding: 0,
              font: {
                size: 12,
                family: 'system-ui'
              }
            }
          },
          yLactate: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Lactate (mmol/L)',
              padding: { bottom: 5 },
              font: {
                size: 14,
                family: 'system-ui'
              }
            },
            beginAtZero: true,
            suggestedMax: Math.max(...sortedSteps.map(s => s.lactate_mmol_l)) * 1.2,
            ticks: {
              padding: 0,
              maxRotation: 0,
              autoSkip: true,
              autoSkipPadding: 10,
              font: {
                size: 12,
                family: 'system-ui'
              }
            }
          },
          yHeartRate: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Heart Rate (bpm)',
              padding: { bottom: 5 },
              font: {
                size: 14,
                family: 'system-ui'
              }
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              padding: 0,
              maxRotation: 0,
              autoSkip: true,
              autoSkipPadding: 10,
              font: {
                size: 12,
                family: 'system-ui'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          annotation: {
            annotations: {
              ...(lt1 && {
                lt1Line: {
                  type: 'line',
                  xMin: lt1.intensity,
                  xMax: lt1.intensity,
                  yMin: 0,
                  yMax: Math.max(...sortedSteps.map(s => s.lactate_mmol_l)) * 1.2,
                  borderColor: 'rgba(255, 99, 132, 0.5)',
                  borderWidth: 2,
                  label: {
                    display: true,
                    content: 'LT1',
                    position: 'end',
                    yAdjust: -5,
                    font: {
                      size: 12,
                      family: 'system-ui'
                    }
                  }
                }
              }),
              ...(lt2 && {
                lt2Line: {
                  type: 'line',
                  xMin: lt2.intensity,
                  xMax: lt2.intensity,
                  yMin: 0,
                  yMax: Math.max(...sortedSteps.map(s => s.lactate_mmol_l)) * 1.2,
                  borderColor: 'rgba(255, 159, 64, 0.5)',
                  borderWidth: 2,
                  label: {
                    display: true,
                    content: 'LT2',
                    position: 'end',
                    yAdjust: -5,
                    font: {
                      size: 12,
                      family: 'system-ui'
                    }
                  }
                }
              }),
              ...(lt1 && {
                diagonalLine: {
                  type: 'line',
                  xMin: lt1.intensity,
                  yMin: lt1.lactate_mmol_l,
                  xMax: Math.max(...sortedSteps.map(s => s.intensity)),
                  yMax: Math.max(...sortedSteps.map(s => s.lactate_mmol_l)),
                  borderColor: 'rgba(200, 200, 200, 0.5)',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  yScaleID: 'yLactate'
                }
              })
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [steps, lt1, lt2]);

  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] bg-white rounded-lg shadow-sm p-1 sm:p-4 overflow-hidden">
      <canvas ref={chartRef} className="chart-canvas"></canvas>
    </div>
  );
} 