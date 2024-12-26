'use client';

import { useEffect, useRef, useState } from 'react';
import { Step } from '../types';

interface StepsTableProps {
  steps: Step[];
  onStepsChange: (steps: Step[]) => void;
}

// Add validation constants
const VALIDATION_RULES = {
  intensity: {
    min: 0,
    max: 2000, // Reasonable max for power/speed
    step: 1,
    placeholder: "200",
    errorMessage: "Intensity must be between 0 and 2000"
  },
  heart_rate_bpm: {
    min: 0,
    max: 250,
    step: 1,
    placeholder: "120",
    errorMessage: "Heart rate must be between 0 and 250 bpm"
  },
  lactate_mmol_l: {
    min: 0,
    max: 30,
    step: 0.1,
    placeholder: "1.0",
    errorMessage: "Lactate must be between 0 and 30 mmol/L"
  }
} as const;

interface ValidationError {
  field: keyof Step;
  message: string;
}

export default function StepsTable({ steps, onStepsChange }: StepsTableProps) {
  const nextIdRef = useRef(1);
  const [validationErrors, setValidationErrors] = useState<Record<number, ValidationError[]>>({});

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

  // Helper function to validate a single field
  const validateField = (field: keyof Step, value: number): string | null => {
    const rules = VALIDATION_RULES[field];
    if (typeof value !== 'number' || isNaN(value)) {
      return `Invalid ${field} value`;
    }
    if (value < rules.min || value > rules.max) {
      return rules.errorMessage;
    }
    return null;
  };

  // Enhanced updateStep with validation
  const updateStep = (id: number, field: keyof Step, rawValue: string) => {
    const value = Number(rawValue);
    const currentErrors = validationErrors[id] || [];
    
    // Remove existing errors for this field
    const otherErrors = currentErrors.filter(error => error.field !== field);
    
    // Validate new value
    const error = validateField(field, value);
    const newErrors = error 
      ? [...otherErrors, { field, message: error }]
      : otherErrors;

    // Update validation errors state
    setValidationErrors(prev => ({
      ...prev,
      [id]: newErrors
    }));

    // Update step value even if invalid (to allow typing)
    onStepsChange(
      steps.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  // Enhanced addStep with validation
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

  const formatLactate = (value: number): string => {
    // Return empty string if value is 0 (for empty input field)
    if (value === 0) return '';
    // Format to always show one decimal place
    return value.toFixed(1);
  };

  // Helper function to get field-specific error
  const getFieldError = (stepId: number, field: keyof Step): string | undefined => {
    return validationErrors[stepId]?.find(error => error.field === field)?.message;
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
                    <input
                      id={`intensity-${step.id}`}
                      type="number"
                      value={step.intensity || ''}
                      onChange={(e) => updateStep(step.id, 'intensity', e.target.value)}
                      placeholder={VALIDATION_RULES.intensity.placeholder}
                      min={VALIDATION_RULES.intensity.min}
                      max={VALIDATION_RULES.intensity.max}
                      step={VALIDATION_RULES.intensity.step}
                      className={`data-input ${getFieldError(step.id, 'intensity') ? 'border-red-500' : ''}`}
                      aria-label={`Intensity for step ${index + 1}`}
                      aria-invalid={!!getFieldError(step.id, 'intensity')}
                      aria-describedby={`intensity-error-${step.id}`}
                    />
                    {getFieldError(step.id, 'intensity') && (
                      <div 
                        id={`intensity-error-${step.id}`}
                        className="absolute left-0 top-full mt-1 text-sm text-red-600"
                      >
                        {getFieldError(step.id, 'intensity')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <input
                      id={`heart-rate-${step.id}`}
                      type="number"
                      value={step.heart_rate_bpm || ''}
                      onChange={(e) => updateStep(step.id, 'heart_rate_bpm', e.target.value)}
                      placeholder={VALIDATION_RULES.heart_rate_bpm.placeholder}
                      min={VALIDATION_RULES.heart_rate_bpm.min}
                      max={VALIDATION_RULES.heart_rate_bpm.max}
                      step={VALIDATION_RULES.heart_rate_bpm.step}
                      className={`data-input ${getFieldError(step.id, 'heart_rate_bpm') ? 'border-red-500' : ''}`}
                      aria-label={`Heart rate for step ${index + 1}`}
                      aria-invalid={!!getFieldError(step.id, 'heart_rate_bpm')}
                      aria-describedby={`heart-rate-error-${step.id}`}
                    />
                    {getFieldError(step.id, 'heart_rate_bpm') && (
                      <div 
                        id={`heart-rate-error-${step.id}`}
                        className="absolute left-0 top-full mt-1 text-sm text-red-600"
                      >
                        {getFieldError(step.id, 'heart_rate_bpm')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-0.5">
                  <div className="relative w-full">
                    <input
                      id={`lactate-${step.id}`}
                      type="number"
                      value={step.lactate_mmol_l ? formatLactate(step.lactate_mmol_l) : ''}
                      onChange={(e) => updateStep(step.id, 'lactate_mmol_l', e.target.value)}
                      placeholder={VALIDATION_RULES.lactate_mmol_l.placeholder}
                      min={VALIDATION_RULES.lactate_mmol_l.min}
                      max={VALIDATION_RULES.lactate_mmol_l.max}
                      step={VALIDATION_RULES.lactate_mmol_l.step}
                      className={`data-input ${getFieldError(step.id, 'lactate_mmol_l') ? 'border-red-500' : ''}`}
                      aria-label={`Lactate for step ${index + 1}`}
                      aria-invalid={!!getFieldError(step.id, 'lactate_mmol_l')}
                      aria-describedby={`lactate-error-${step.id}`}
                    />
                    {getFieldError(step.id, 'lactate_mmol_l') && (
                      <div 
                        id={`lactate-error-${step.id}`}
                        className="absolute left-0 top-full mt-1 text-sm text-red-600"
                      >
                        {getFieldError(step.id, 'lactate_mmol_l')}
                      </div>
                    )}
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