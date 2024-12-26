'use client';

import { Step } from '../types';
import ChartContainer from './ChartContainer';

interface TestResultsProps {
  steps: Step[];
  lt1: Step | null;
  lt2: Step | null;
}

export default function TestResults({ steps, lt1, lt2 }: TestResultsProps) {
  const generateMarkdown = () => {
    let md = `# Lactate Test Results\n\n`;

    if (lt1) {
      md += `## LT1 (Aerobic Threshold)\n`;
      md += `- Intensity: ${lt1.intensity}\n`;
      md += `- Heart Rate: ${lt1.heart_rate_bpm} bpm\n`;
      md += `- Lactate: ${lt1.lactate_mmol_l} mmol/L\n\n`;
    }

    if (lt2) {
      md += `## LT2 (Anaerobic Threshold)\n`;
      md += `- Intensity: ${lt2.intensity}\n`;
      md += `- Heart Rate: ${lt2.heart_rate_bpm} bpm\n`;
      md += `- Lactate: ${lt2.lactate_mmol_l} mmol/L\n\n`;
    }

    md += `## Raw Data\n\n`;
    md += `| Step # | Intensity | Heart Rate (bpm) | Lactate (mmol/L) |\n`;
    md += `|--------|-----------|------------------|------------------|\n`;

    const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);
    sortedSteps.forEach((step, index) => {
      md += `| ${index + 1} | ${step.intensity} | ${step.heart_rate_bpm} | ${step.lactate_mmol_l} |\n`;
    });

    return md;
  };

  const copyToClipboard = async () => {
    const markdown = generateMarkdown();
    try {
      await navigator.clipboard.writeText(markdown);
      alert('Results copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy results to clipboard');
    }
  };

  if (!lt1 && !lt2) return null;

  return (
    <div className="space-y-8 overflow-x-hidden">
      <div className="space-y-6">
        <h2 className="text-[24px] sm:text-2xl font-semibold">Results:</h2>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {lt1 && (
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg shadow-sm 
                          transition-all hover:shadow-md">
              <h3 className="text-[22px] sm:text-[22px] font-medium">LT1 (Aerobic Threshold):</h3>
              <p className="text-[20px] sm:text-[20px]">Intensity: {lt1.intensity}</p>
              <p className="text-[20px] sm:text-[20px]">Heart Rate: {lt1.heart_rate_bpm} bpm</p>
              <p className="text-[20px] sm:text-[20px]">Lactate: {lt1.lactate_mmol_l} mmol/L</p>
            </div>
          )}
          {lt2 && (
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg shadow-sm 
                          transition-all hover:shadow-md">
              <h3 className="text-[22px] sm:text-[22px] font-medium">LT2 (Anaerobic Threshold):</h3>
              <p className="text-[20px] sm:text-[20px]">Intensity: {lt2.intensity}</p>
              <p className="text-[20px] sm:text-[20px]">Heart Rate: {lt2.heart_rate_bpm} bpm</p>
              <p className="text-[20px] sm:text-[20px]">Lactate: {lt2.lactate_mmol_l} mmol/L</p>
            </div>
          )}
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
          {generateMarkdown()}
        </pre>
      </div>
    </div>
  );
} 