'use client';

import { useState } from 'react';
import StepsTable from './components/StepsTable';
import ThresholdCalculator from './components/ThresholdCalculator';
import { Step } from './types';

export default function Home() {
  const [steps, setSteps] = useState<Step[]>([]);

  return (
    <main className="min-h-screen py-8">
      <div id="main-container" className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Lact8</h1>
        <div className="space-y-4">
          <StepsTable steps={steps} onStepsChange={setSteps} />
          <div className="flex gap-4 justify-start">
            <ThresholdCalculator steps={steps} />
          </div>
        </div>
      </div>
    </main>
  );
}
