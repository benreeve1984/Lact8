'use client';

import { useMemo, useEffect, useState } from 'react';
import { Step } from '../types';
import ChartContainer from './ChartContainer';

interface TestResultsProps {
  steps: Step[];
  lt1: Step | null;
  lt2: Step | null;
}

interface ThresholdData {
  name: string;
  label: string;
  data: Step;
  fields: Array<{
    key: keyof Step;
    label: string;
    format: (value: number | null) => string;
  }>;
}

interface MarkdownSection {
  title: string;
  content: string[];
}

export default function TestResults({ steps, lt1, lt2 }: TestResultsProps) {
  const [markdownContent, setMarkdownContent] = useState('');

  // Helper function to format lactate values
  const formatLactate = (value: number): string => {
    return value.toFixed(1);
  };

  useEffect(() => {
    // Create markdown table with improved formatting
    const tableRows = steps.map((step, index) => {
      return `| ${index + 1} | ${step.intensity} | ${step.heart_rate_bpm} | ${formatLactate(step.lactate_mmol_l)} |`;
    }).join('\n');

    const markdown = `
# Lactate Test Results

${lt1 ? `**LT1 (Aerobic Threshold):**\n- Intensity: ${lt1.intensity}\n- Heart Rate: ${lt1.heart_rate_bpm} bpm\n- Lactate: ${formatLactate(lt1.lactate_mmol_l)} mmol/L\n` : ''}
${lt2 ? `\n**LT2 (Anaerobic Threshold):**\n- Intensity: ${lt2.intensity}\n- Heart Rate: ${lt2.heart_rate_bpm} bpm\n- Lactate: ${formatLactate(lt2.lactate_mmol_l)} mmol/L\n` : ''}

## Test Steps
| Step | Intensity | HR | Lactate |
|------|-----------|----|---------|\n${tableRows}
    `.trim();

    setMarkdownContent(markdown);
  }, [steps, lt1, lt2]);

  const formatIntensity = (value: number | null) => value?.toString() ?? 'N/A';
  const formatHeartRate = (value: number | null) => value ? `${value} bpm` : 'N/A';

  const thresholdData: ThresholdData[] = [
    {
      name: 'lt1',
      label: 'LT1 (Aerobic Threshold)',
      data: lt1 ?? {} as Step,
      fields: [
        { key: 'intensity', label: 'Intensity', format: formatIntensity },
        { key: 'heart_rate_bpm', label: 'Heart Rate', format: formatHeartRate },
        { key: 'lactate_mmol_l', label: 'Lactate', format: formatLactate }
      ]
    },
    {
      name: 'lt2',
      label: 'LT2 (Anaerobic Threshold)',
      data: lt2 ?? {} as Step,
      fields: [
        { key: 'intensity', label: 'Intensity', format: formatIntensity },
        { key: 'heart_rate_bpm', label: 'Heart Rate', format: formatHeartRate },
        { key: 'lactate_mmol_l', label: 'Lactate', format: formatLactate }
      ]
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      alert('Results copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy results to clipboard');
    }
  };

  if (!lt1 && !lt2) {
    return (
      <div className="analysis-container">
        <h2 className="analysis-title">Analysis Complete</h2>
        <div className="space-y-2">
          <p className="analysis-message">
            No lactate thresholds could be identified from the provided data.
          </p>
          <ul className="analysis-list">
            <li>Ensure you have at least 4 data points</li>
            <li>Check that intensity values are in ascending order</li>
            <li>Verify lactate values show a clear progression</li>
            <li>Look for any outliers or incorrect data entries</li>
          </ul>
        </div>
        
        {steps.length > 0 && (
          <div className="mt-6">
            <h3 className="chart-title">Current Data Visualization:</h3>
            <ChartContainer steps={steps} lt1={null} lt2={null} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="space-y-6">
        <h2 className="results-title">Results:</h2>
        <div className="threshold-grid">
          {thresholdData.map(threshold => (
            (threshold.name === 'lt1' && lt1) || (threshold.name === 'lt2' && lt2) ? (
              <div 
                key={threshold.name}
                className="threshold-card"
              >
                <h3 className="threshold-card-title">
                  {threshold.label}:
                </h3>
                {threshold.fields.map(field => (
                  <p key={field.key} className="threshold-value">
                    {field.label}: {field.format(threshold.data[field.key])}
                  </p>
                ))}
              </div>
            ) : null
          ))}
        </div>
      </div>

      <ChartContainer steps={steps} lt1={lt1} lt2={lt2} />
      
      <div className="markdown-section">
        <div className="markdown-header">
          <h2 className="markdown-title">Markdown Report</h2>
          <div className="markdown-actions">
            <button 
              onClick={copyToClipboard} 
              className="btn inline-flex items-center justify-center gap-2"
            >
              <span className="hidden sm:inline">Copy Results to Clipboard</span>
              <span className="sm:hidden">Copy</span>
            </button>
          </div>
        </div>
        <div className="markdown-wrapper">
          <pre className="markdown-content">
            {markdownContent}
          </pre>
        </div>
      </div>
    </div>
  );
} 