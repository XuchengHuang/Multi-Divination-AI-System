
import React from 'react';
import { LifePathNumberInputData } from '../types';

interface LifePathNumberInputProps {
  onChange: (data: LifePathNumberInputData) => void;
  initialData?: LifePathNumberInputData;
}

export const LifePathNumberInput: React.FC<LifePathNumberInputProps> = ({ onChange, initialData }) => {
  const dob = initialData?.dob || '';

  return (
    <div>
      <label htmlFor="dob-lifepath" className="block text-sm font-medium text-slate-300 mb-1">
        Date of Birth
      </label>
      <input
        type="date"
        id="dob-lifepath"
        value={dob}
        onChange={(e) => onChange({ dob: e.target.value })}
        className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-slate-100"
        max={new Date().toISOString().split("T")[0]} // Prevent future dates
      />
    </div>
  );
};
