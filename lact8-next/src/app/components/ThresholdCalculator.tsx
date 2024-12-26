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

// Helper function to find LT1 based on lactate increase threshold
function findLT1(sortedSteps: Step[], lactateThreshold: number): number {
  for (let i = 1; i < sortedSteps.length - 1; i++) {
    const prev = sortedSteps[i - 1].lactate_mmol_l;
    const current = sortedSteps[i].lactate_mmol_l;
    const next = sortedSteps[i + 1].lactate_mmol_l;
    
    // Look for first point where lactate increases by more than the threshold
    if (current - prev > lactateThreshold || next - current > lactateThreshold) {
      return i;
    }
  }
  return -1;
}

// Helper function to find the step with maximum lactate
function findMaxLactateStep(steps: Step[]): Step {
  const maxLactate = Math.max(...steps.map(s => s.lactate_mmol_l));
  const maxCandidates = steps.filter(s => s.lactate_mmol_l === maxLactate);
  return maxCandidates.reduce((acc, curr) =>
    curr.intensity > acc.intensity ? curr : acc
  );
}

// Helper function to find LT2 using distance method
function findLT2(sortedSteps: Step[], lt1Index: number, maxStep: Step): number {
  let maxDistance = -1;
  let lt2Index = -1;
  
  const x1 = sortedSteps[lt1Index].intensity;
  const y1 = sortedSteps[lt1Index].lactate_mmol_l;
  const x2 = maxStep.intensity;
  const y2 = maxStep.lactate_mmol_l;

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
  
  return lt2Index;
}

export default function ThresholdCalculator({ steps }: ThresholdCalculatorProps) {
  const [lt1, setLt1] = useState<Step | null>(null);
  const [lt2, setLt2] = useState<Step | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const calculateThresholds = () => {
    // Validate minimum required steps
    if (steps.length < 4) {
      alert('Please add at least 4 steps to calculate thresholds');
      return;
    }

    // Reset previous results
    setLt1(null);
    setLt2(null);
    setHasCalculated(true);

    // Sort steps by intensity to ensure correct order
    const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);
    
    // Find LT1 (first significant increase in lactate)
    const lt1Index = findLT1(sortedSteps, 0.3);
    
    // Set LT1 if found
    if (lt1Index !== -1) {
      setLt1(sortedSteps[lt1Index]);
      
      // Find LT2 only if LT1 was found
      const maxStep = findMaxLactateStep(sortedSteps);
      const lt2Index = findLT2(sortedSteps, lt1Index, maxStep);
      
      // Set LT2 if found
      if (lt2Index !== -1) {
        setLt2(sortedSteps[lt2Index]);
      }
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
      {hasCalculated && (
        <TestResults steps={steps} lt1={lt1} lt2={lt2} />
      )}
    </div>
  );
} 