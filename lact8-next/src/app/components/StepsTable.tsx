'use client';

import { useEffect, useRef } from 'react';
import { Step } from '../types';

interface StepsTableProps {
  steps: Step[];
  onStepsChange: (steps: Step[]) => void;
}

export default function StepsTable({ steps, onStepsChange }: StepsTableProps) {
  // Add a ref to keep track of the next ID
  const nextIdRef = useRef(1);

  // Helper function to generate unique IDs
  const generateUniqueId = () => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  };

  // Initialize with 5 empty rows only if no steps are provided
  useEffect(() => {
    if (steps.length === 0) {
      const initialSteps: Step[] = Array.from({ length: 5 }, () => ({
        id: generateUniqueId(),
        intensity: 0,
        heart_rate_bpm: 0,
        lactate_mmol_l: 0
      }));
      onStepsChange(initialSteps);
    }
  }, []); // Keep dependency array empty to prevent re-initialization

  const addStep = () => {
    const newStep: Step = {
      id: generateUniqueId(),
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

  const formatLactate = (value: number): string => {
    // Return empty string if value is 0 (for empty input field)
    if (value === 0) return '';
    // Format to always show one decimal place
    return value.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto w-full">
        <table 
          className="data-table"
          aria-label="Test steps data entry table"
        >
          <thead>
            <tr>
              <th className="w-[5%] min-w-[2rem] px-1" scope="col">
                #
              </th>
              <th className="w-[30%] min-w-[6rem] px-0.5" scope="col">
                <span className="hidden sm:inline">Intensity</span>
                <span className="sm:hidden">Int</span>
              </th>
              <th className="w-[30%] min-w-[6rem] px-0.5" scope="col">
                <span className="hidden sm:inline">Heart Rate</span>
                <span className="sm:hidden">HR</span>
              </th>
              <th className="w-[30%] min-w-[6rem] px-0.5" scope="col">
                <span className="hidden sm:inline">Lactate</span>
                <span className="sm:hidden">Lac</span>
              </th>
              <th className="w-[5%] min-w-[2rem] px-1" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={step.id} className="hover:bg-secondary/50">
                <td className="text-center px-1">
                  {index + 1}
                </td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <label 
                      htmlFor={`intensity-${step.id}`} 
                      className="sr-only"
                    >
                      Intensity for step {index + 1}
                    </label>
                    <input
                      id={`intensity-${step.id}`}
                      type="number"
                      value={step.intensity || ''}
                      onChange={(e) => updateStep(step.id, 'intensity', Number(e.target.value))}
                      placeholder="200"
                      className="data-input"
                      aria-label={`Intensity for step ${index + 1}`}
                      min="0"
                      aria-describedby={`intensity-hint-${step.id}`}
                    />
                    <span id={`intensity-hint-${step.id}`} className="sr-only">
                      Enter power or speed value
                    </span>
                  </div>
                </td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <label 
                      htmlFor={`heart-rate-${step.id}`} 
                      className="sr-only"
                    >
                      Heart rate for step {index + 1}
                    </label>
                    <input
                      id={`heart-rate-${step.id}`}
                      type="number"
                      value={step.heart_rate_bpm || ''}
                      onChange={(e) => updateStep(step.id, 'heart_rate_bpm', Number(e.target.value))}
                      placeholder="120"
                      className="data-input"
                      aria-label={`Heart rate for step ${index + 1}`}
                      min="0"
                      max="250"
                      aria-describedby={`heart-rate-hint-${step.id}`}
                    />
                    <span id={`heart-rate-hint-${step.id}`} className="sr-only">
                      Enter heart rate in beats per minute, between 0 and 250
                    </span>
                  </div>
                </td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <label 
                      htmlFor={`lactate-${step.id}`} 
                      className="sr-only"
                    >
                      Lactate for step {index + 1}
                    </label>
                    <input
                      id={`lactate-${step.id}`}
                      type="number"
                      value={step.lactate_mmol_l ? formatLactate(step.lactate_mmol_l) : ''}
                      onChange={(e) => updateStep(step.id, 'lactate_mmol_l', Number(e.target.value))}
                      placeholder="1.0"
                      step="0.1"
                      className="data-input"
                      aria-label={`Lactate for step ${index + 1}`}
                      min="0"
                      max="30"
                      aria-describedby={`lactate-hint-${step.id}`}
                    />
                    <span id={`lactate-hint-${step.id}`} className="sr-only">
                      Enter lactate value in millimoles per liter, between 0 and 30
                    </span>
                  </div>
                </td>
                <td className="text-center px-1">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => removeStep(step.id)}
                      aria-label={`Remove step ${index + 1}`}
                      className="text-red-500 hover:text-red-700 w-6 h-6 inline-flex items-center justify-center leading-none"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button 
          onClick={addStep} 
          className="btn inline-block"
          aria-label="Add new step to the table"
        >
          Add Step
        </button>
      </div>
    </div>
  );
} 