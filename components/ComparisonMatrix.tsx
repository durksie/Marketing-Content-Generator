import React, { useState } from 'react';
import { GenerationResult, PerformanceMetrics } from '../types';
import { RevertIcon, ClearHistoryIcon, CloseIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface ComparisonMatrixProps {
  history: GenerationResult[];
  onRevert: (index: number) => void;
  onClear: () => void;
  onClose: () => void;
}

const PerformanceMetricsDisplay: React.FC<{ metrics?: PerformanceMetrics }> = ({ metrics }) => {
  if (!metrics) return null;
  const { generationTime, tokenUsage } = metrics;
  return (
    <div className="mt-auto pt-3 border-t border-base-300 flex flex-col text-xs text-content space-y-1">
        <div className="flex items-center space-x-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Time: <strong className="text-text-primary">{generationTime.toFixed(2)}s</strong></span>
        </div>
        {tokenUsage !== undefined && tokenUsage > 0 && (
            <div className="flex items-center space-x-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M9 5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                </svg>
                <span>Tokens: <strong className="text-text-primary">{tokenUsage}</strong></span>
            </div>
        )}
    </div>
  );
};


const ComparisonItem: React.FC<{ result: GenerationResult; onRevert: () => void; version: number; isLatest: boolean }> = ({ result, onRevert, version, isLatest }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (typeof result.content !== 'string') {
        return null; // Don't render comparison for non-text content like posters
    }
    
    const content = result.content;
    const isLongContent = content.length > 300;
    const displayContent = isLongContent && !isExpanded ? `${content.substring(0, 300)}...` : content;

    return (
        <div className="flex-shrink-0 w-80 bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-text-primary">Version {version}</h4>
                {isLatest && <span className="text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">LATEST</span>}
            </div>
            
            <div className="prose prose-sm max-w-none prose-p:text-content prose-headings:text-text-primary prose-strong:text-text-primary flex-grow">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
            </div>
            
            {isLongContent && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-brand-secondary hover:underline">
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}

            <PerformanceMetricsDisplay metrics={result.performance} />
            
            {!isLatest && (
                <button 
                    onClick={onRevert}
                    className="w-full mt-2 text-sm bg-base-200 border border-base-300 hover:bg-brand-primary text-text-primary hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                    <RevertIcon />
                    Use this Version
                </button>
            )}
        </div>
    );
};


export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ history, onRevert, onClear, onClose }) => {
    if (history.length <= 1) {
        return null;
    }

    // Don't show for poster content which isn't text-based
    if (typeof history[0]?.content !== 'string') {
        return null;
    }

    return (
        <div className="bg-base-200 rounded-2xl shadow-lg p-6 animate-fade-in border border-base-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-text-primary">Generation History</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onClear}
                        className="text-sm bg-base-200 border border-base-300 hover:bg-red-500 text-text-primary hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                        <ClearHistoryIcon />
                        Clear History
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-content hover:bg-base-100 hover:text-text-primary transition-colors"
                        aria-label="Close comparison view"
                    >
                        <CloseIcon />
                    </button>
                </div>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {history.map((result, index) => (
                    <ComparisonItem 
                        key={index} 
                        result={result}
                        version={index + 1}
                        isLatest={index === history.length - 1}
                        onRevert={() => onRevert(index)}
                    />
                ))}
            </div>
        </div>
    );
};