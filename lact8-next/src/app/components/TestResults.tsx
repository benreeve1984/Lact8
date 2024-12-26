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
    // Create markdown table
    const tableRows = steps.map((step, index) => {
      return `| ${index + 1} | ${step.intensity} | ${step.heart_rate_bpm} | ${formatLactate(step.lactate_mmol_l)} |`;
    }).join('\n');

    const markdown = `
### Lactate Test Results

${lt1 ? `LT1: ${lt1.intensity} @ ${formatLactate(lt1.lactate_mmol_l)} mmol/L (HR: ${lt1.heart_rate_bpm})` : ''}
${lt2 ? `LT2: ${lt2.intensity} @ ${formatLactate(lt2.lactate_mmol_l)} mmol/L (HR: ${lt2.heart_rate_bpm})` : ''}

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
      <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
        <h2 className="text-[24px] sm:text-2xl font-semibold">Analysis Complete</h2>
        <div className="space-y-2">
          <p className="text-[18px] sm:text-xl">
            No lactate thresholds could be identified from the provided data.
          </p>
          <ul className="list-disc list-inside space-y-1 text-[16px] sm:text-lg">
            <li>Ensure you have at least 4 data points</li>
            <li>Check that intensity values are in ascending order</li>
            <li>Verify lactate values show a clear progression</li>
            <li>Look for any outliers or incorrect data entries</li>
          </ul>
        </div>
        
        {steps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[20px] sm:text-xl font-medium mb-4">Current Data Visualization:</h3>
            <ChartContainer steps={steps} lt1={null} lt2={null} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 overflow-x-hidden">
      <div className="space-y-6">
        <h2 className="text-[24px] sm:text-2xl font-semibold">Results:</h2>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {thresholdData.map(threshold => (
            (threshold.name === 'lt1' && lt1) || (threshold.name === 'lt2' && lt2) ? (
              <div 
                key={threshold.name}
                className="space-y-2 p-4 bg-secondary/30 rounded-lg shadow-sm 
                          transition-all hover:shadow-md"
              >
                <h3 className="text-[22px] sm:text-[22px] font-medium">
                  {threshold.label}:
                </h3>
                {threshold.fields.map(field => (
                  <p key={field.key} className="text-[20px] sm:text-[20px]">
                    {field.label}: {field.format(threshold.data[field.key])}
                  </p>
                ))}
              </div>
            ) : null
          ))}
        </div>
      </div>

      <ChartContainer steps={steps} lt1={lt1} lt2={lt2} />
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-[24px] sm:text-[24px] font-semibold">Markdown Report</h2>
          <button 
            onClick={copyToClipboard} 
            className="btn inline-flex items-center justify-center"
          >
            <span>Copy Results to Clipboard</span>
          </button>
        </div>
        <pre className="p-3 sm:p-4 bg-secondary rounded-lg shadow-sm overflow-x-auto 
                      text-[16px] sm:text-[16px] font-mono">
          {markdownContent}
        </pre>
      </div>
    </div>
  );
} 