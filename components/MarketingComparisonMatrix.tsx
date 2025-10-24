import React, { useState } from 'react';
import { ContentType } from '../types';
import { CloseIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface DynamicComparisonRow {
    type: ContentType;
    icon: React.ReactNode;
    features: string;
    output: string;
    tokens: number;
    visual: string; // imageUrl
}

interface MarketingComparisonMatrixProps {
    isLoading: boolean;
    results: DynamicComparisonRow[] | null;
    error: string | null;
    onClose: () => void;
}

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
        <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-2xl font-bold text-text-primary mt-4">Generating Comparisons...</h3>
        <p className="mt-2 text-content">The AI is creating content for different formats. Please wait.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
     <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg m-4" role="alert">
        <strong className="font-bold">Error Generating Comparison:</strong>
        <p className="mt-1">{message}</p>
    </div>
);

const OutputCell: React.FC<{ content: string }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongContent = content.length > 300;
    const displayContent = isLongContent && !isExpanded ? `${content.substring(0, 300)}...` : content;

    return (
        <div className="text-content text-sm relative">
            <div className={`prose prose-sm max-w-none prose-p:text-content ${!isExpanded && isLongContent ? 'max-h-32 overflow-hidden' : ''}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
            </div>
            {isLongContent && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-brand-secondary hover:underline mt-1 font-semibold">
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
};

export const MarketingComparisonMatrix: React.FC<MarketingComparisonMatrixProps> = ({ isLoading, results, error, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-base-200 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-6 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-text-primary">Marketing Content Comparison</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-content hover:bg-base-100 hover:text-text-primary transition-colors"
                        aria-label="Close comparison matrix"
                    >
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6">
                    {isLoading && <LoadingState />}
                    {error && <ErrorState message={error} />}
                    {results && !isLoading && !error && (
                         <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed">
                                <thead className="border-b border-base-300">
                                    <tr>
                                        <th className="p-4 w-[15%] text-sm font-semibold text-content uppercase tracking-wider">Content Type</th>
                                        <th className="p-4 w-[20%] text-sm font-semibold text-content uppercase tracking-wider">Key Features</th>
                                        <th className="p-4 w-[40%] text-sm font-semibold text-content uppercase tracking-wider">Generated Output</th>
                                        <th className="p-4 w-[10%] text-sm font-semibold text-content uppercase tracking-wider">Tokens</th>
                                        <th className="p-4 w-[15%] text-sm font-semibold text-content uppercase tracking-wider text-center">Visual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-base-300">
                                    {results.map((row) => (
                                        <tr key={row.type}>
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-text-primary flex items-center space-x-2">
                                                    <span className="text-brand-secondary">{row.icon}</span>
                                                    <span>{row.type}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <p className="text-content text-sm">{row.features}</p>
                                            </td>
                                            <td className="p-4 align-top">
                                               <OutputCell content={row.output} />
                                            </td>
                                            <td className="p-4 align-top">
                                                <p className="text-text-primary font-mono">{row.tokens}</p>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex justify-center items-center">
                                                    <img src={row.visual} alt={`${row.type} visual summary`} className="w-32 h-auto object-cover rounded-lg shadow-lg" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};