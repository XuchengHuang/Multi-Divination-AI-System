
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onSubmit: (name: string, question: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name or a nickname.");
      return;
    }
    if (!question.trim()) {
      setError("Please enter your question or area of focus.");
      return;
    }
    setError(null);
    onSubmit(name, question);
  };

  return (
    <section className="bg-slate-800 bg-opacity-70 p-6 md:p-8 rounded-xl shadow-2xl backdrop-blur-md w-full">
      <h2 className="text-3xl font-semibold mb-6 text-purple-300 text-center">Welcome to Your Divination Journey!</h2>
      <p className="text-slate-300 mb-6 text-center">
        To begin, please tell us a bit about yourself and what you're seeking.
      </p>
      {error && <p className="text-red-400 bg-red-900 bg-opacity-50 p-3 rounded-md mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="user-name" className="block text-sm font-medium text-slate-300 mb-1">
            Your Name or Nickname:
          </label>
          <input
            type="text"
            id="user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-slate-100 shadow-sm"
            placeholder="e.g., Alex, Curious Seeker"
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="main-question" className="block text-sm font-medium text-slate-300 mb-1">
            Your Main Question or Area of Focus:
          </label>
          <textarea
            id="main-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-slate-100 shadow-sm"
            placeholder="e.g., What should I know about my career path? How can I improve my relationships?"
            aria-required="true"
          />
          <p className="text-xs text-slate-400 mt-1">This will help guide the AI in its analysis, especially for methods like Tarot.</p>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
          >
            Start Your Divination
          </button>
        </div>
      </form>
    </section>
  );
};
