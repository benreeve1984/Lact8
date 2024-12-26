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

  // Initialize chart only once
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Create initial empty chart with responsive configuration
    chartInstance.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: []
      },
      options: {
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
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Lactate (mmol/L)',
              padding: { bottom: 5 },
              font: {
                weight: '600'
              }
            },
            beginAtZero: true,
            suggestedMax: 0,
            ticks: {
              padding: 2
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
            position: 'top',
            align: 'center',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 10,
              font: {
                size: 11,
                family: 'system-ui'
              },
              usePointStyle: true,
              pointStyle: true
            }
          },
          annotation: {
            annotations: {}
          }
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Update chart data and options when props change
  useEffect(() => {
    if (!chartInstance.current) return;

    const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);
    const maxLactateValue = Math.max(...sortedSteps.map(s => s.lactate_mmol_l)) * 1.2;
    
    // Find the step with maximum lactate value
    const maxLactateStep = sortedSteps.reduce((max, step) => 
      step.lactate_mmol_l > max.lactate_mmol_l ? step : max
    );

    // Update datasets
    chartInstance.current.data.datasets = [
      {
        label: 'Lactate',
        data: sortedSteps.map(step => ({
          x: step.intensity,
          y: step.lactate_mmol_l
        })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgb(59, 130, 246)',
        yAxisID: 'yLactate',
        showLine: true,
        tension: 0,
        pointStyle: 'circle'
      },
      {
        label: 'Heart Rate',
        data: sortedSteps.map(step => ({
          x: step.intensity,
          y: step.heart_rate_bpm
        })),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgb(249, 115, 22)',
        yAxisID: 'yHeartRate',
        showLine: true,
        tension: 0,
        pointStyle: 'rect'
      }
    ];

    // Helper function to create vertical line annotation
    const createVerticalLine = (step: Step, label: string, color: string) => ({
      type: 'line',
      xMin: step.intensity,
      xMax: step.intensity,
      yMin: 0,
      yMax: maxLactateValue,
      borderColor: color,
      borderWidth: 2,
      yScaleID: 'yLactate',
      label: {
        display: true,
        content: label,
        position: 'end',
        yAdjust: -5,
        font: {
          size: 12,
          family: 'system-ui'
        }
      }
    });

    // Build annotations object
    const annotations = {
      ...(lt1 && {
        lt1Line: createVerticalLine(lt1, 'LT1', 'rgba(255, 99, 132, 0.5)'),
        diagonalLine: {
          type: 'line',
          xMin: lt1.intensity,
          yMin: lt1.lactate_mmol_l,
          xMax: maxLactateStep.intensity,
          yMax: maxLactateStep.lactate_mmol_l,
          borderColor: 'rgba(200, 200, 200, 0.5)',
          borderWidth: 2,
          borderDash: [5, 5],
          yScaleID: 'yLactate'
        }
      }),
      ...(lt2 && {
        lt2Line: createVerticalLine(lt2, 'LT2', 'rgba(255, 159, 64, 0.5)')
      })
    };

    // Update annotations
    if (chartInstance.current.options.plugins?.annotation) {
      chartInstance.current.options.plugins.annotation = { annotations };
    }

    // Update y-axis scale for lactate
    if (chartInstance.current.options.scales?.['yLactate']) {
      chartInstance.current.options.scales['yLactate'].suggestedMax = maxLactateValue;
    }

    // Update the chart
    chartInstance.current.update('none');

  }, [steps, lt1, lt2]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} className="chart-canvas"></canvas>
    </div>
  );
} 