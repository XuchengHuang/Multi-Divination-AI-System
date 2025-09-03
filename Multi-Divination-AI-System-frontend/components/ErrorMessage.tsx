
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-700 bg-opacity-80 text-white p-4 rounded-lg shadow-lg my-4 text-center">
      <p className="font-semibold">Error:</p>
      <p>{message}</p>
    </div>
  );
};
