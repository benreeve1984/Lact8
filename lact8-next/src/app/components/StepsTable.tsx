'use client';

import { useEffect, useState } from 'react';
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
  }, []);  // Remove steps and onStepsChange from dependencies to prevent re-initialization

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
    <div className="max-w-4xl mx-auto">
      <table>
        <thead>
          <tr>
            <th>Step #</th>
            <th>Intensity</th>
            <th>Heart Rate</th>
            <th>Lactate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, index) => (
            <tr key={step.id}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="number"
                  value={step.intensity || ''}
                  onChange={(e) => updateStep(step.id, 'intensity', Number(e.target.value))}
                  placeholder="e.g. 200"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={step.heart_rate_bpm || ''}
                  onChange={(e) => updateStep(step.id, 'heart_rate_bpm', Number(e.target.value))}
                  placeholder="e.g. 103"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={step.lactate_mmol_l || ''}
                  onChange={(e) => updateStep(step.id, 'lactate_mmol_l', Number(e.target.value))}
                  placeholder="e.g. 1.0"
                  step="0.1"
                />
              </td>
              <td>
                <button
                  onClick={() => removeStep(step.id)}
                  className="btn btn-danger"
                  aria-label="Remove step"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-4">
        <button onClick={addStep} className="btn btn-primary">
          Add Step
        </button>
      </div>
    </div>
  );
} 