
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="w-full max-w-5xl py-8 mb-8 text-center">
      <div className="inline-flex items-center">
        <SparklesIcon className="w-10 h-10 md:w-12 md:h-12 text-purple-400 mr-3 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
          {title}
        </h1>
      </div>
      <p className="text-slate-300 mt-2 text-lg">Your AI-powered guide to multifaceted self-discovery.</p>
    </header>
  );
};
