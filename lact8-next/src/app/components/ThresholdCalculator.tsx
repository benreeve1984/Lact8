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

// Add new validation helper functions
function validateStepData(step: Step): string | null {
  if (typeof step.intensity !== 'number' || isNaN(step.intensity)) {
    return `Invalid intensity value: ${step.intensity}`;
  }
  if (typeof step.lactate_mmol_l !== 'number' || isNaN(step.lactate_mmol_l)) {
    return `Invalid lactate value: ${step.lactate_mmol_l}`;
  }
  if (step.lactate_mmol_l < 0 || step.lactate_mmol_l > 30) {
    return `Lactate value out of range (0-30): ${step.lactate_mmol_l}`;
  }
  if (step.intensity <= 0) {
    return `Intensity must be greater than 0: ${step.intensity}`;
  }
  return null;
}

function validateStepsOrder(steps: Step[]): string | null {
  for (let i = 1; i < steps.length; i++) {
    if (steps[i].intensity <= steps[i-1].intensity) {
      return `Steps must be in ascending order by intensity. Check steps ${i} and ${i+1}`;
    }
  }
  return null;
}

export default function ThresholdCalculator({ steps }: ThresholdCalculatorProps) {
  const [lt1, setLt1] = useState<Step | null>(null);
  const [lt2, setLt2] = useState<Step | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateThresholds = () => {
    try {
      // Reset states
      setError(null);
      setLt1(null);
      setLt2(null);
      setHasCalculated(true);

      // Basic validation
      if (!Array.isArray(steps)) {
        throw new Error('Invalid steps data: expected an array');
      }

      // Filter out empty or zero-value steps
      const validSteps = steps.filter(step => 
        step.intensity > 0 && step.lactate_mmol_l > 0
      );

      if (validSteps.length < 4) {
        throw new Error('Please add at least 4 valid data points to calculate thresholds');
      }

      // Validate each step's data
      for (const step of validSteps) {
        const validationError = validateStepData(step);
        if (validationError) {
          throw new Error(validationError);
        }
      }

      // Sort steps by intensity
      const sortedSteps = [...validSteps].sort((a, b) => a.intensity - b.intensity);

      // Validate steps are in ascending order
      const orderError = validateStepsOrder(sortedSteps);
      if (orderError) {
        throw new Error(orderError);
      }

      // Validate lactate progression
      const hasLactateProgression = sortedSteps.some((step, i) => 
        i > 0 && step.lactate_mmol_l > sortedSteps[i-1].lactate_mmol_l + 0.3
      );
      if (!hasLactateProgression) {
        throw new Error('Unable to detect lactate threshold - insufficient lactate progression');
      }

      // Find LT1
      const lt1Index = findLT1(sortedSteps, 0.3);
      if (lt1Index === -1) {
        throw new Error('Could not identify LT1 - check data progression');
      }

      // Set LT1
      setLt1(sortedSteps[lt1Index]);

      try {
        // Find LT2
        const maxStep = findMaxLactateStep(sortedSteps);
        const lt2Index = findLT2(sortedSteps, lt1Index, maxStep);
        
        if (lt2Index !== -1) {
          setLt2(sortedSteps[lt2Index]);
        } else {
          console.warn('LT2 could not be identified - this is normal for some datasets');
        }
      } catch (lt2Error) {
        console.warn('Error calculating LT2:', lt2Error);
        // Don't throw - LT2 calculation failure shouldn't invalidate LT1
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      console.error('Threshold calculation error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={calculateThresholds} 
        className="btn inline-block"
        aria-label="Calculate lactate thresholds"
      >
        Calculate Thresholds
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            {error}
          </p>
        </div>
      )}

      {hasCalculated && !error && (
        <TestResults steps={steps} lt1={lt1} lt2={lt2} />
      )}
    </div>
  );
} 