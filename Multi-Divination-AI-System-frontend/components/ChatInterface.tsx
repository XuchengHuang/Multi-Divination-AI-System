
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon'; // Assuming a send icon or similar might be useful

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (messageText: string) => Promise<void>;
  isLoading: boolean;
  userName: string;
  onEndChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, userName, onEndChat }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;
    setInputText(''); // Clear input immediately
    await onSendMessage(inputText.trim());
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="bg-slate-800 bg-opacity-80 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-md w-full flex flex-col max-h-[80vh] h-[calc(100vh-200px)] min-h-[400px]">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
        <h2 className="text-xl sm:text-2xl font-semibold text-purple-300">Chat with Aura (AI Companion)</h2>
        <button
          onClick={onEndChat}
          className="px-4 py-2 text-xs sm:text-sm bg-slate-600 hover:bg-slate-500 text-white rounded-lg shadow-md transition-colors"
        >
          End Chat
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-purple-200 text-right' : 'text-slate-400 text-left'}`}>
                {msg.sender === 'ai' ? 'Aura' : userName} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg shadow bg-slate-700 text-slate-200 rounded-bl-none">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-1.5" style={{animationDelay: '0s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-1.5" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
               <p className="text-xs mt-1 text-slate-400 text-left">Aura is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your report or share your thoughts..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-slate-100 shadow-sm disabled:opacity-50"
            disabled={isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user'}
            aria-label="Chat message input"
          />
          <button
            onClick={handleSend}
            disabled={isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user'}
            className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 3.105a1.5 1.5 0 012.122-.001l7.072 7.072a.75.75 0 000 1.061L5.227 18.305a1.5 1.5 0 01-2.122-2.122l5.06-5.061-5.06-5.06zM15.25 10a.75.75 0 01-.75.75H6.75a.75.75 0 010-1.5h7.75a.75.75 0 01.75.75z" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a0e8c; /* purple-700 variant */
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #5f1ba3; /* purple-600 variant */
        }
      `}</style>
    </section>
  );
};
