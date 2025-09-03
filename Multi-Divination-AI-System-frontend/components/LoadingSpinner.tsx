
import React from 'react';

interface LoadingSpinnerProps {
  large?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ large = false }) => {
  const sizeClasses = large ? "w-10 h-10" : "w-5 h-5";
  return (
    <div className={`animate-spin rounded-full ${sizeClasses} border-t-2 border-b-2 border-purple-400`}></div>
  );
};
