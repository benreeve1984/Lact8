'use client';

import { useState } from 'react';
import StepsTable from './components/StepsTable';
import ThresholdCalculator from './components/ThresholdCalculator';
import { Step } from './types';

const demoData: Omit<Step, 'id'>[] = [
  { intensity: 200, heart_rate_bpm: 103, lactate_mmol_l: 1.0 },
  { intensity: 220, heart_rate_bpm: 111, lactate_mmol_l: 0.9 },
  { intensity: 240, heart_rate_bpm: 111, lactate_mmol_l: 1.0 },
  { intensity: 260, heart_rate_bpm: 115, lactate_mmol_l: 1.2 },
  { intensity: 280, heart_rate_bpm: 118, lactate_mmol_l: 1.6 },
  { intensity: 300, heart_rate_bpm: 123, lactate_mmol_l: 2.2 },
  { intensity: 320, heart_rate_bpm: 128, lactate_mmol_l: 3.0 },
  { intensity: 340, heart_rate_bpm: 135, lactate_mmol_l: 4.1 },
  { intensity: 360, heart_rate_bpm: 150, lactate_mmol_l: 7.0 },
  { intensity: 380, heart_rate_bpm: 170, lactate_mmol_l: 11.0 },
  { intensity: 400, heart_rate_bpm: 188, lactate_mmol_l: 15.0 },
];

export default function Home() {
  const [steps, setSteps] = useState<Step[]>([]);

  const populateDemoData = () => {
    const stepsWithIds = demoData.map(step => ({
      ...step,
      id: Date.now() + Math.random()
    }));
    setSteps(stepsWithIds);
  };

  return (
    <main className="min-h-screen py-8">
      <div id="main-container" className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Lact8</h1>
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <button 
              onClick={populateDemoData}
              className="btn btn-primary"
            >
              Populate Demo Test
            </button>
          </div>
          <StepsTable steps={steps} onStepsChange={setSteps} />
          <ThresholdCalculator steps={steps} />
        </div>
      </div>
    </main>
  );
}
