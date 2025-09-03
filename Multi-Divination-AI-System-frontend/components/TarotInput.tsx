
import React, { useState, useEffect } from 'react';
import { TarotInputData } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface TarotInputProps {
  onChange: (data: TarotInputData) => void;
  initialData?: TarotInputData;
  question?: string; // The global question from the user
}

const NUM_CARDS_TO_DRAW = 1; // Or 3 for a simple spread

export const TarotInput: React.FC<TarotInputProps> = ({ onChange, initialData, question }) => {
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [readingInitiated, setReadingInitiated] = useState(initialData?.initiateReading || false);

  const totalCardsDisplayed = 5; // Number of cards shown for selection

  useEffect(() => {
    // If reading was initiated (e.g. by selecting enough cards, or from initialData)
    // inform the parent.
    onChange({ initiateReading: readingInitiated });
  }, [readingInitiated, onChange]);

  useEffect(() => {
    // Check if initialData already has reading initiated
    // This handles cases where user navigates back and forth
    if (initialData?.initiateReading) {
        setReadingInitiated(true);
        // If we want to persist which cards were 'selected' (visually), more state would be needed.
        // For simplicity now, if initiated, we just show the "initiated" message.
    }
  }, [initialData]);


  const handleCardClick = (index: number) => {
    if (readingInitiated || selectedCardIndices.includes(index) || selectedCardIndices.length >= NUM_CARDS_TO_DRAW) {
      return; // Already initiated, card already selected, or max cards drawn
    }

    const newSelectedIndices = [...selectedCardIndices, index];
    setSelectedCardIndices(newSelectedIndices);

    if (newSelectedIndices.length >= NUM_CARDS_TO_DRAW) {
      setReadingInitiated(true);
    }
  };

  const resetSelection = () => {
    setSelectedCardIndices([]);
    setReadingInitiated(false);
    onChange({ initiateReading: false }); // Notify parent of reset
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-medium text-slate-300 mb-1">Your Question for the Tarot:</h4>
        <p className="p-3 bg-slate-600 rounded-md text-slate-100 italic break-words">
          {question ? `"${question}"` : "No global question provided."}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          The AI will perform a conceptual tarot reading based on this question.
        </p>
      </div>
      
      {!readingInitiated ? (
        <>
          <p className="text-center text-slate-300 font-medium">
            Please draw {NUM_CARDS_TO_DRAW} card{NUM_CARDS_TO_DRAW > 1 ? 's' : ''} for your reading.
          </p>
          <div className="flex justify-center items-center flex-wrap gap-3 sm:gap-4 my-4" role="group" aria-label="Tarot cards">
            {Array.from({ length: totalCardsDisplayed }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                disabled={selectedCardIndices.length >= NUM_CARDS_TO_DRAW && !selectedCardIndices.includes(index)}
                className={`w-20 h-32 sm:w-24 sm:h-36 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75
                  ${selectedCardIndices.includes(index)
                    ? 'bg-purple-500 ring-purple-300 border-2 border-yellow-400 -translate-y-2'
                    : 'bg-slate-700 hover:bg-slate-600 ring-purple-500'}
                  ${selectedCardIndices.length >= NUM_CARDS_TO_DRAW && !selectedCardIndices.includes(index) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                aria-label={`Draw card ${index + 1}`}
                style={{
                  // Basic card back pattern
                  backgroundImage: `
                    radial-gradient(circle at 1px 1px, #A076F9 1px, transparent 0), 
                    radial-gradient(circle at 10px 10px, #A076F9 1px, transparent 0)
                  `,
                  backgroundSize: '12px 12px',
                  backgroundPosition: 'center center',
                }}
              >
                <span className="sr-only">Card {index + 1}</span>
                {selectedCardIndices.includes(index) && (
                   <SparklesIcon className="w-8 h-8 mx-auto my-auto text-yellow-300 opacity-90 animate-ping absolute inset-0" style={{animationDuration: '1.5s'}}/>
                )}
              </button>
            ))}
          </div>
          {selectedCardIndices.length > 0 && selectedCardIndices.length < NUM_CARDS_TO_DRAW && (
            <p className="text-center text-sm text-slate-400">
              Selected {selectedCardIndices.length} of {NUM_CARDS_TO_DRAW} card{NUM_CARDS_TO_DRAW > 1 ? 's' : ''}.
            </p>
          )}
        </>
      ) : (
        <div className="p-4 bg-green-700 bg-opacity-30 rounded-lg text-center">
          <p className="font-semibold text-green-300 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 inline mr-2" />
            Tarot reading initiated! ({selectedCardIndices.length} card{selectedCardIndices.length > 1 ? 's' : ''} drawn)
          </p>
          <p className="text-sm text-slate-300">The AI will consider your question and drawn card(s) during analysis.</p>
          <button
            onClick={resetSelection}
            className="mt-3 text-sm text-purple-300 hover:text-purple-200 underline"
          >
            Redraw card(s)
          </button>
        </div>
      )}
    </div>
  );
};
