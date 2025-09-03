
import React, { useState } from 'react';
import { Report } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

interface ReportDisplayProps {
  report: Report;
  icon?: React.ReactNode;
  isIndividual?: boolean;
  className?: string;
}

// Helper function for basic inline markdown (bold, italic)
const renderMarkdownInline = (text: string, baseKey: string): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /(\*\*(.*?)\*\*|__(.*?)__|\*(.*?)\*|_(.*?)_)/g;
  let match;
  let partKey = 0;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const boldTextDoubleStar = match[2];
    const boldTextDoubleUnderscore = match[3];
    const italicTextSingleStar = match[4];
    const italicTextSingleUnderscore = match[5];

    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    if (boldTextDoubleStar !== undefined) {
      elements.push(<strong key={`${baseKey}-md-${partKey++}`}>{boldTextDoubleStar}</strong>);
    } else if (boldTextDoubleUnderscore !== undefined) {
      elements.push(<strong key={`${baseKey}-md-${partKey++}`}>{boldTextDoubleUnderscore}</strong>);
    } else if (italicTextSingleStar !== undefined) {
      elements.push(<em key={`${baseKey}-md-${partKey++}`}>{italicTextSingleStar}</em>);
    } else if (italicTextSingleUnderscore !== undefined) {
      elements.push(<em key={`${baseKey}-md-${partKey++}`}>{italicTextSingleUnderscore}</em>);
    }
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }
  
  return elements.length > 0 ? elements : [text];
};


export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, icon, isIndividual = false, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(!isIndividual); 

  const toggleExpand = () => {
    if (isIndividual) {
      setIsExpanded(!isExpanded);
    }
  };

  const generateFormattedContent = (): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let keyCounter = 0;
    let currentListType: 'ul' | 'ol' | null = null;
    let currentListItems: React.ReactNode[] = [];

    const flushList = () => {
      if (currentListType && currentListItems.length > 0) {
        elements.push(
          React.createElement(currentListType, { key: `list-${keyCounter++}`, className: "mb-3" }, ...currentListItems)
        );
      }
      currentListItems = [];
      currentListType = null;
    };

    const lines = report.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      let lineText = lines[i].trim();
      const lineKey = `line-${keyCounter}-${i}`;

      if (lineText.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={`h3-${keyCounter++}`}>{renderMarkdownInline(lineText.substring(4), lineKey)}</h3>);
      } else if (lineText.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={`h2-${keyCounter++}`}>{renderMarkdownInline(lineText.substring(3), lineKey)}</h2>);
      } else if (lineText.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={`h1-${keyCounter++}`}>{renderMarkdownInline(lineText.substring(2), lineKey)}</h1>);
      } else if (lineText.startsWith('* ') || lineText.startsWith('- ')) {
        if (currentListType !== 'ul') {
          flushList();
          currentListType = 'ul';
        }
        currentListItems.push(<li key={`li-${keyCounter++}`}>{renderMarkdownInline(lineText.substring(2), lineKey)}</li>);
      } else if (lineText.match(/^\d+\.\s/)) {
        if (currentListType !== 'ol') {
          flushList();
          currentListType = 'ol';
        }
        currentListItems.push(<li key={`li-${keyCounter++}`}>{renderMarkdownInline(lineText.replace(/^\d+\.\s/, ''), lineKey)}</li>);
      } else if (lineText.length > 0) {
        flushList();
        elements.push(<p key={`p-${keyCounter++}`}>{renderMarkdownInline(lineText, lineKey)}</p>);
      } else { 
        flushList(); 
      }
    }
    flushList(); 
    return elements.filter(Boolean);
  };
  
  const formattedContent = generateFormattedContent();

  return (
    <section className={`p-6 rounded-xl shadow-2xl ${className}`}>
      <div 
        className={`flex items-center justify-between ${isIndividual ? 'cursor-pointer' : ''}`}
        onClick={toggleExpand}
        role={isIndividual ? "button" : undefined}
        aria-expanded={isIndividual ? isExpanded : undefined}
        tabIndex={isIndividual ? 0 : undefined}
        onKeyDown={isIndividual ? (e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(); } : undefined}
      >
        <div className="text-2xl font-semibold text-purple-300 flex items-center">
          {icon}
          <span className={icon ? "ml-3" : ""}>{report.title}</span>
        </div>
        {isIndividual && (
            isExpanded ? <ChevronUpIcon className="w-6 h-6 text-purple-400" /> : <ChevronDownIcon className="w-6 h-6 text-purple-400" />
        )}
      </div>
      {isExpanded && (
        <div 
          className={`mt-4 prose prose-invert max-w-none 
            prose-p:text-slate-100 prose-p:leading-relaxed prose-p:mb-4
            prose-headings:text-purple-300 
            prose-h1:text-3xl prose-h1:font-extrabold prose-h1:mt-6 prose-h1:mb-4
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-purple-500 prose-h2:pb-2
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2
            prose-strong:text-pink-400 
            prose-em:text-teal-300 prose-em:italic
            prose-ul:text-slate-200 prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-3
            prose-ol:text-slate-200 prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-3
            prose-li:my-1
            ${isIndividual ? 'pt-4 border-t border-slate-700' : ''}`}
        >
          {formattedContent}
        </div>
      )}
    </section>
  );
};
