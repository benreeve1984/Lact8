'use client';

import { Step } from '../types';

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
    <div className="mt-6 results-container max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Export Results</h2>
        <button 
          onClick={copyToClipboard}
          className="btn btn-primary"
        >
          Copy as Markdown
        </button>
      </div>
      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
        <code>{generateMarkdown()}</code>
      </pre>
    </div>
  );
} 