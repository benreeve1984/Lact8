'use client';

import { useState } from 'react';
import { Step } from '../types';
import TestResults from './TestResults';

interface ThresholdCalculatorProps {
  steps: Step[];
}

// Helper function to calculate distance from point to line
function calculateDistance(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
  if (x2 === x1) {
    return Math.abs(y - y1);
  }
  const slope = (y2 - y1) / (x2 - x1);
  const intercept = y1 - slope * x1;
  const expectedY = slope * x + intercept;
  return Math.abs(y - expectedY);
}

export default function ThresholdCalculator({ steps }: ThresholdCalculatorProps) {
  const [lt1, setLt1] = useState<Step | null>(null);
  const [lt2, setLt2] = useState<Step | null>(null);

  const calculateThresholds = () => {
    if (steps.length < 4) {
      alert('Please add at least 4 steps to calculate thresholds');
      return;
    }

    // Sort steps by intensity to ensure correct order
    const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);
    
    // Find LT1 (first significant increase in lactate)
    let lt1Index = -1;
    for (let i = 1; i < sortedSteps.length - 1; i++) {
      const prev = sortedSteps[i - 1].lactate_mmol_l;
      const current = sortedSteps[i].lactate_mmol_l;
      const next = sortedSteps[i + 1].lactate_mmol_l;
      
      // Look for first point where lactate increases by more than 0.3 mmol/L
      if (current - prev > 0.3 || next - current > 0.3) {
        lt1Index = i;
        break;
      }
    }

    // Find LT2 using distance method from LT1 to max lactate point
    let lt2Index = -1;
    
    if (lt1Index !== -1) {
      // Find max lactate point
      let maxLactate = Math.max(...sortedSteps.map(s => s.lactate_mmol_l));
      let maxCandidates = sortedSteps.filter(s => s.lactate_mmol_l === maxLactate);
      let maxStep = maxCandidates.reduce((acc, curr) =>
        curr.intensity > acc.intensity ? curr : acc
      );

      // Line from LT1 to max lactate step
      const x1 = sortedSteps[lt1Index].intensity;
      const y1 = sortedSteps[lt1Index].lactate_mmol_l;
      const x2 = maxStep.intensity;
      const y2 = maxStep.lactate_mmol_l;

      let maxDistance = -1;

      // Find point with maximum distance from the line between LT1 and max lactate
      for (let i = lt1Index + 1; i < sortedSteps.length; i++) {
        const step = sortedSteps[i];
        if (step.intensity > Math.min(x1, x2) && step.intensity < Math.max(x1, x2)) {
          const dist = calculateDistance(x1, y1, x2, y2, step.intensity, step.lactate_mmol_l);
          if (dist > maxDistance) {
            maxDistance = dist;
            lt2Index = i;
          }
        }
      }
    }

    // Set thresholds if found
    if (lt1Index !== -1) {
      setLt1(sortedSteps[lt1Index]);
    } else {
      setLt1(null);
    }
    
    if (lt2Index !== -1) {
      setLt2(sortedSteps[lt2Index]);
    } else {
      setLt2(null);
    }
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={calculateThresholds} 
        className="btn inline-block"
      >
        Calculate Thresholds
      </button>
      <TestResults steps={steps} lt1={lt1} lt2={lt2} />
    </div>
  );
} 