
import React from 'react';
import { DivinationMethod } from '../types';
import { DIVINATION_METHODS_CONFIG } from '../constants';

interface DivinationMethodSelectorProps {
  selectedMethods: Set<DivinationMethod>;
  onMethodToggle: (method: DivinationMethod) => void;
}

export const DivinationMethodSelector: React.FC<DivinationMethodSelectorProps> = ({ selectedMethods, onMethodToggle }) => {
  return (
    <section className="bg-slate-800 bg-opacity-70 p-6 rounded-xl shadow-2xl backdrop-blur-md">
      <h2 className="text-2xl font-semibold mb-6 text-purple-300 border-b-2 border-purple-400 pb-2">
        Choose Your Divination Methods
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DIVINATION_METHODS_CONFIG.map(({ id, name, description }) => (
          <button
            key={id}
            onClick={() => onMethodToggle(id)}
            className={`p-4 rounded-lg text-left transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${selectedMethods.has(id) ? 'bg-purple-600 text-white shadow-lg ring-purple-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-200 ring-slate-500'}`}
          >
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm opacity-80 mt-1">{description}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
