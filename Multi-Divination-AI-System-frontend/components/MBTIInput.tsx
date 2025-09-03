
import React, { useState, useEffect, useCallback } from 'react';
import { MBTIInputData } from '../types';
import { MBTI_TYPES, MBTI_QUIZ_QUESTIONS } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon'; // Assuming you have this icon

interface MBTIInputProps {
  onChange: (data: MBTIInputData) => void;
  initialData?: MBTIInputData;
}

type QuizMode = 'choose' | 'quiz' | 'manual' | 'result';

export const MBTIInput: React.FC<MBTIInputProps> = ({ onChange, initialData }) => {
  const [mode, setMode] = useState<QuizMode>('choose');
  const [manualType, setManualType] = useState(initialData?.type || '');
  const [quizAnswers, setQuizAnswers] = useState<Partial<Record<'EI' | 'SN' | 'TF' | 'JP', string>>>({});
  const [derivedType, setDerivedType] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.type && mode !== 'manual' && mode !== 'result') {
      setManualType(initialData.type);
      setMode('manual'); // If initial data has type, assume manual entry mode for editing
    }
  }, [initialData, mode]);


  const handleQuizAnswer = useCallback((dichotomy: 'EI' | 'SN' | 'TF' | 'JP', value: string) => {
    setQuizAnswers(prev => ({ ...prev, [dichotomy]: value }));
  }, []);

  const calculateQuizResult = useCallback(() => {
    if (Object.keys(quizAnswers).length === MBTI_QUIZ_QUESTIONS.length) {
      const type = `${quizAnswers.EI}${quizAnswers.SN}${quizAnswers.TF}${quizAnswers.JP}`;
      setDerivedType(type);
      onChange({ type });
      setMode('result');
    }
  }, [quizAnswers, onChange]);

  useEffect(() => {
    // Automatically try to calculate result when all quiz answers are in
    if (mode === 'quiz' && Object.keys(quizAnswers).length === MBTI_QUIZ_QUESTIONS.length) {
      calculateQuizResult();
    }
  }, [quizAnswers, mode, calculateQuizResult]);

  const resetQuiz = () => {
    setQuizAnswers({});
    setDerivedType(null);
    setMode('quiz');
    onChange({ type: '' }); // Clear type from parent
  };
  
  const handleManualTypeChange = (newType: string) => {
    setManualType(newType);
    onChange({ type: newType });
  };


  if (mode === 'choose') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-slate-300">Do you know your MBTI Personality Type?</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setMode('manual')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Yes, I know my type
          </button>
          <button
            onClick={() => {
                setManualType(''); // Clear any previous manual type
                onChange({ type: '' }); // Clear type in parent
                resetQuiz(); // Ensure quiz state is fresh
                setMode('quiz');
            }}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            No, help me find it (Quick Quiz)
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'manual') {
    return (
      <div>
        <label htmlFor="mbti-type-manual" className="block text-sm font-medium text-slate-300 mb-1">
          Your MBTI Type
        </label>
        <select
          id="mbti-type-manual"
          value={manualType}
          onChange={(e) => handleManualTypeChange(e.target.value)}
          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-slate-100"
        >
          <option value="">Select your type</option>
          {MBTI_TYPES.map(mbtiType => (
            <option key={mbtiType} value={mbtiType}>{mbtiType}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">If you're unsure, you can go back and take our quick quiz.</p>
        <button
            onClick={() => setMode('choose')}
            className="mt-3 text-sm text-purple-400 hover:text-purple-300"
        >
            &larr; Back to choice
        </button>
      </div>
    );
  }

  if (mode === 'quiz') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-purple-300">MBTI Quick Quiz</h3>
        <p className="text-sm text-slate-400">Answer these questions to get an idea of your potential MBTI type. This is a simplified quiz for fun.</p>
        {MBTI_QUIZ_QUESTIONS.map(q => (
          <div key={q.id} className="p-4 bg-slate-700 rounded-lg shadow">
            <p className="font-medium text-slate-200 mb-3">{q.text}</p>
            <div className="space-y-2">
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleQuizAnswer(q.dichotomy, opt.value)}
                  className={`w-full text-left p-3 rounded-md transition-colors text-sm
                    ${quizAnswers[q.dichotomy] === opt.value 
                      ? 'bg-purple-600 text-white font-semibold ring-2 ring-purple-300' 
                      : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
             {quizAnswers[q.dichotomy] && <p className="text-xs text-green-400 mt-2">Selected: {quizAnswers[q.dichotomy]}</p>}
          </div>
        ))}
        <div className="flex justify-between items-center mt-4">
            <button
                onClick={() => setMode('choose')}
                className="text-sm text-purple-400 hover:text-purple-300"
            >
                &larr; Back to choice
            </button>
            {Object.keys(quizAnswers).length === MBTI_QUIZ_QUESTIONS.length && (
                 <p className="text-sm text-green-300">All questions answered. Your type is being determined.</p>
            )}
        </div>
      </div>
    );
  }
  
  if (mode === 'result' && derivedType) {
    return (
      <div className="text-center p-4 bg-slate-700 rounded-lg">
        <SparklesIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
        <h3 className="text-xl font-semibold text-purple-300">Your Suggested MBTI Type:</h3>
        <p className="text-3xl font-bold text-white my-2">{derivedType}</p>
        <p className="text-sm text-slate-400">This is based on your quiz answers. You can use this type for the divination.</p>
        <div className="mt-4 space-x-3">
          <button
            onClick={resetQuiz}
            className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-500 text-white rounded-md"
          >
            Retake Quiz
          </button>
           <button
            onClick={() => setMode('choose')}
            className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300"
          >
            Change Method
          </button>
        </div>
      </div>
    );
  }

  // Fallback or initial loading state, though 'choose' should cover initial.
  return <p>Loading MBTI input...</p>; 
};
