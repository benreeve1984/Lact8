'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Step } from '../types';
import { memo } from 'react';

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

// Memoized table row component
const TableRow = memo(({ 
  step, 
  index, 
  inputFields,
  onRemove,
  onUpdate,
  getFieldError 
}: { 
  step: Step;
  index: number;
  inputFields: typeof INPUT_FIELDS;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof Step, value: string) => void;
  getFieldError: (stepId: number, field: keyof Step) => string | undefined;
}) => {
  return (
    <tr className="hover:bg-secondary/50">
      <td className="text-center px-1">
        {index + 1}
      </td>
      {inputFields.map(field => (
        <TableCell
          key={`${step.id}-${field.key}`}
          step={step}
          index={index}
          field={field}
          onUpdate={onUpdate}
          getFieldError={getFieldError}
        />
      ))}
      <td className="text-center px-1">
        <div className="flex justify-center">
          <button 
            onClick={() => onRemove(step.id)}
            aria-label={`Remove step ${index + 1}`}
            className="text-red-500 hover:text-red-700 w-6 h-6 inline-flex items-center justify-center leading-none"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </td>
    </tr>
  );
});

// Memoized table cell component
const TableCell = memo(({ 
  step, 
  index, 
  field,
  onUpdate,
  getFieldError 
}: { 
  step: Step;
  index: number;
  field: typeof INPUT_FIELDS[number];
  onUpdate: (id: number, field: keyof Step, value: string) => void;
  getFieldError: (stepId: number, field: keyof Step) => string | undefined;
}) => {
  const error = getFieldError(step.id, field.key);
  const value = field.format 
    ? field.format(step[field.key]) 
    : step[field.key] || '';

  return (
    <td className="px-0.5">
      <div className="relative w-full">
        <input
          id={`${field.key}-${step.id}`}
          type="number"
          value={value}
          onChange={(e) => onUpdate(step.id, field.key, e.target.value)}
          placeholder={field.config.placeholder}
          min={field.config.min}
          max={field.config.max}
          step={field.config.step}
          className={`data-input ${error ? 'border-red-500' : ''}`}
          aria-label={`${field.label} for step ${index + 1}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.key}-error-${step.id}` : undefined}
        />
        {error && (
          <div 
            id={`${field.key}-error-${step.id}`}
            className="absolute left-0 top-full mt-1 text-sm text-red-600"
          >
            {error}
          </div>
        )}
      </div>
    </td>
  );
});

// Memoized input fields configuration
const INPUT_FIELDS = [
  { 
    key: 'intensity', 
    label: 'Intensity',
    shortLabel: 'Int',
    config: VALIDATION_RULES.intensity 
  },
  { 
    key: 'heart_rate_bpm', 
    label: 'Heart Rate',
    shortLabel: 'HR',
    config: VALIDATION_RULES.heart_rate_bpm 
  },
  { 
    key: 'lactate_mmol_l', 
    label: 'Lactate',
    shortLabel: 'Lac',
    config: VALIDATION_RULES.lactate_mmol_l,
    format: (value: number) => value === 0 ? '' : value.toFixed(1)
  }
] as const;

export default function StepsTable({ steps, onStepsChange }: StepsTableProps) {
  const nextIdRef = useRef(1);
  const [validationErrors, setValidationErrors] = useState<Record<number, ValidationError[]>>({});

  // Memoized helper functions
  const generateUniqueId = useCallback(() => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  }, []);

  const validateField = useCallback((field: keyof Step, value: number): string | null => {
    const rules = VALIDATION_RULES[field];
    if (typeof value !== 'number' || isNaN(value)) {
      return `Invalid ${field} value`;
    }
    if (value < rules.min || value > rules.max) {
      return rules.errorMessage;
    }
    return null;
  }, []);

  const getFieldError = useCallback((stepId: number, field: keyof Step): string | undefined => {
    return validationErrors[stepId]?.find(error => error.field === field)?.message;
  }, [validationErrors]);

  // Memoized event handlers
  const updateStep = useCallback((id: number, field: keyof Step, rawValue: string) => {
    const value = Number(rawValue);
    const currentErrors = validationErrors[id] || [];
    const otherErrors = currentErrors.filter(error => error.field !== field);
    const error = validateField(field, value);
    const newErrors = error ? [...otherErrors, { field, message: error }] : otherErrors;

    setValidationErrors(prev => ({
      ...prev,
      [id]: newErrors
    }));

    onStepsChange(
      steps.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  }, [steps, validationErrors, validateField, onStepsChange]);

  const removeStep = useCallback((id: number) => {
    onStepsChange(steps.filter(step => step.id !== id));
  }, [steps, onStepsChange]);

  const addStep = useCallback(() => {
    const newStep: Step = {
      id: generateUniqueId(),
      intensity: 0,
      heart_rate_bpm: 0,
      lactate_mmol_l: 0
    };
    onStepsChange([...steps, newStep]);
  }, [steps, generateUniqueId, onStepsChange]);

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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto w-full">
        <table 
          className="data-table"
          aria-label="Test steps data entry table"
        >
          <thead>
            <tr>
              <th className="w-[5%] min-w-[2rem] px-1" scope="col">#</th>
              {INPUT_FIELDS.map(field => (
                <th 
                  key={field.key} 
                  className="w-[30%] min-w-[6rem] px-0.5" 
                  scope="col"
                >
                  <span className="hidden sm:inline">{field.label}</span>
                  <span className="sm:hidden">{field.shortLabel}</span>
                </th>
              ))}
              <th className="w-[5%] min-w-[2rem] px-1" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <TableRow
                key={step.id}
                step={step}
                index={index}
                inputFields={INPUT_FIELDS}
                onRemove={removeStep}
                onUpdate={updateStep}
                getFieldError={getFieldError}
              />
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