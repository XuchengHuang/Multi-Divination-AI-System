
import React from 'react';
import { AstrologyInputData } from '../types';

interface AstrologyInputProps {
  onChange: (data: AstrologyInputData) => void;
  initialData?: AstrologyInputData;
}

export const AstrologyInput: React.FC<AstrologyInputProps> = ({ onChange, initialData }) => {
  const dob = initialData?.dob || '';
  const tob = initialData?.tob || '';
  const pob = initialData?.pob || '';

  const handleChange = (field: keyof AstrologyInputData, value: string) => {
    onChange({
      dob,
      tob,
      pob,
      [field]: value,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="dob-astrology" className="block text-sm font-medium text-slate-300 mb-1">
          Date of Birth
        </label>
        <input
          type="date"
          id="dob-astrology"
          value={dob}
          onChange={(e) => handleChange('dob', e.target.value)}
          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-slate-100"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>
      <div>
        <label htmlFor="tob-astrology" className="block text-sm font-medium text-slate-300 mb-1">
          Time of Birth (approximate is okay)
        </label>
        <input
          type="time"
          id="tob-astrology"
          value={tob}
          onChange={(e) => handleChange('tob', e.target.value)}
          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-slate-100"
        />
      </div>
      <div>
        <label htmlFor="pob-astrology" className="block text-sm font-medium text-slate-300 mb-1">
          Place of Birth (City, Country)
        </label>
        <input
          type="text"
          id="pob-astrology"
          value={pob}
          onChange={(e) => handleChange('pob', e.target.value)}
          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-slate-100"
          placeholder="e.g., London, UK"
        />
      </div>
    </div>
  );
};
