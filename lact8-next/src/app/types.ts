export interface Step {
  id: number;
  intensity: number;
  heart_rate_bpm: number;
  lactate_mmol_l: number;
}

export interface ThresholdResult {
  step_number: number;
  intensity: number;
  heart_rate_bpm: number;
  lactate_mmol_l: number;
} 