'use client';

import { ReactNode } from 'react';
import { CHART_DIMENSIONS } from '../constants/chart';

interface ChartContainerProps {
  children: ReactNode;
}

export default function ChartContainer({ children }: ChartContainerProps) {
  return (
    <div 
      className={`${CHART_DIMENSIONS.className} h-[${CHART_DIMENSIONS.height}]`}
      style={{ height: CHART_DIMENSIONS.height }}
    >
      {children}
    </div>
  );
} 