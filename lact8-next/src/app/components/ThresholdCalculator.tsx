'use client';

import { useState } from 'react';
import { Step } from '../types';
import LactateChart from './LactateChart';
import { CHART_DIMENSIONS } from '../constants/chart';
import ChartContainer from './ChartContainer';

interface ThresholdCalculatorProps {
  steps: Step[];
}

// Helper function to calculate distance from point to line
function calculateDistance(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
  // Distance from point to line formula
  const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  return numerator / denominator;
}

export default function ThresholdCalculator({ steps }: ThresholdCalculatorProps) {
  const [lt1, setLt1] = useState<Step | null>(null);
  const [lt2, setLt2] = useState<Step | null>(null);
  const [showChart, setShowChart] = useState(false);

  const calculateThresholds = () => {
    if (steps.length < 4) {
      alert('Please add at least 4 steps to calculate thresholds');
      return;
    }

    // Sort steps by intensity to ensure correct order
    const sortedSteps = [...steps].sort((a, b) => a.intensity - b.intensity);

    // Find LT1 (first significant increase in lactate)
    let lt1Index = -1;
    for (let i = 0; i < sortedSteps.length - 2; i++) {
      const current = sortedSteps[i];
      const next1 = sortedSteps[i + 1];
      const next2 = sortedSteps[i + 2];

      const lactate_diff1 = next1.lactate_mmol_l - current.lactate_mmol_l;
      const lactate_diff2 = next2.lactate_mmol_l - current.lactate_mmol_l;

      if (lactate_diff1 >= 0.3 && lactate_diff2 >= 0.3) {
        lt1Index = i;
        break;
      }
    }

    // Find LT2 using maximum deviation method
    if (lt1Index >= 0) {
      const lt1Step = sortedSteps[lt1Index];
      
      // Find point with maximum lactate
      const maxLactate = Math.max(...sortedSteps.map(s => s.lactate_mmol_l));
      const maxLactateSteps = sortedSteps.filter(s => s.lactate_mmol_l === maxLactate);
      const maxStep = maxLactateSteps.reduce((acc, curr) => 
        curr.intensity > acc.intensity ? curr : acc
      );

      // Find point with maximum deviation from LT1-maxLactate line
      let maxDistance = -1;
      let lt2Step = null;

      for (const step of sortedSteps) {
        if (step.intensity > lt1Step.intensity && step.intensity < maxStep.intensity) {
          const distance = calculateDistance(
            lt1Step.intensity, lt1Step.lactate_mmol_l,
            maxStep.intensity, maxStep.lactate_mmol_l,
            step.intensity, step.lactate_mmol_l
          );
          if (distance > maxDistance) {
            maxDistance = distance;
            lt2Step = step;
          }
        }
      }

      setLt1(lt1Step);
      setLt2(lt2Step);
    }

    setShowChart(true);
  };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <button
          onClick={calculateThresholds}
          className="btn btn-success"
        >
          Calculate Thresholds
        </button>
      </div>

      {(lt1 || lt2) && (
        <div className="results-container max-w-3xl mx-auto mb-6">
          <h2 className="text-xl font-bold mb-4">Results:</h2>
          {lt1 && (
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">LT1 (Aerobic Threshold):</h3>
              <p className="mb-1">Intensity: {lt1.intensity}</p>
              <p className="mb-1">Heart Rate: {lt1.heart_rate_bpm} bpm</p>
              <p>Lactate: {lt1.lactate_mmol_l} mmol/L</p>
            </div>
          )}
          {lt2 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">LT2 (Anaerobic Threshold):</h3>
              <p className="mb-1">Intensity: {lt2.intensity}</p>
              <p className="mb-1">Heart Rate: {lt2.heart_rate_bpm} bpm</p>
              <p>Lactate: {lt2.lactate_mmol_l} mmol/L</p>
            </div>
          )}
        </div>
      )}

      {showChart && steps.length > 0 && (
        <ChartContainer>
          <LactateChart steps={steps} lt1={lt1} lt2={lt2} />
        </ChartContainer>
      )}
    </div>
  );
} 