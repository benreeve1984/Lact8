'use client';

import { useEffect } from 'react';
import { Step } from '../types';

interface StepsTableProps {
  steps: Step[];
  onStepsChange: (steps: Step[]) => void;
}

export default function StepsTable({ steps, onStepsChange }: StepsTableProps) {
  // Initialize with 5 empty rows only if no steps are provided
  useEffect(() => {
    if (steps.length === 0) {
      const initialSteps: Step[] = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        intensity: 0,
        heart_rate_bpm: 0,
        lactate_mmol_l: 0
      }));
      onStepsChange(initialSteps);
    }
  }, []); // Keep dependency array empty to prevent re-initialization

  const addStep = () => {
    const newStep: Step = {
      id: Date.now(),
      intensity: 0,
      heart_rate_bpm: 0,
      lactate_mmol_l: 0
    };
    onStepsChange([...steps, newStep]);
  };

  const removeStep = (id: number) => {
    onStepsChange(steps.filter(step => step.id !== id));
  };

  const updateStep = (id: number, field: keyof Step, value: number) => {
    onStepsChange(
      steps.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto w-full">
        <table className="data-table min-w-[300px] w-full">
          <thead>
            <tr>
              <th className="w-8 px-1">#</th>
              <th className="w-20 sm:w-32 px-0.5">
                <span className="hidden sm:inline">Intensity</span>
                <span className="sm:hidden">Int</span>
              </th>
              <th className="w-20 sm:w-32 px-0.5">
                <span className="hidden sm:inline">Heart Rate</span>
                <span className="sm:hidden">HR</span>
              </th>
              <th className="w-20 sm:w-32 px-0.5">
                <span className="hidden sm:inline">Lactate</span>
                <span className="sm:hidden">Lac</span>
              </th>
              <th className="w-8 px-1"></th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={step.id} className="hover:bg-secondary/50">
                <td className="text-center px-1">{index + 1}</td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={step.intensity || ''}
                      onChange={(e) => updateStep(step.id, 'intensity', Number(e.target.value))}
                      placeholder="200"
                      className="data-input w-full px-1 py-1 text-center"
                      aria-label="Intensity (power or speed)"
                      min="0"
                    />
                  </div>
                </td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={step.heart_rate_bpm || ''}
                      onChange={(e) => updateStep(step.id, 'heart_rate_bpm', Number(e.target.value))}
                      placeholder="120"
                      className="data-input w-full px-1 py-1 text-center"
                      aria-label="Heart rate in beats per minute"
                      min="0"
                      max="250"
                    />
                  </div>
                </td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={step.lactate_mmol_l || ''}
                      onChange={(e) => updateStep(step.id, 'lactate_mmol_l', Number(e.target.value))}
                      placeholder="1.0"
                      step="0.1"
                      className="data-input w-full px-1 py-1 text-center"
                      aria-label="Lactate in millimoles per liter"
                      min="0"
                      max="30"
                    />
                  </div>
                </td>
                <td className="text-center px-1">
                  <div className="flex items-center justify-center">
                    <button 
                      onClick={() => removeStep(step.id)}
                      aria-label="Remove step"
                      className="text-red-500 hover:text-red-700 w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button onClick={addStep} className="btn inline-block">
          Add Step
        </button>
      </div>
    </div>
  );
} 