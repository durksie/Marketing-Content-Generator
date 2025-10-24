import React, { useState } from 'react';
import { GenerationResult, PosterContent, ContentType, PerformanceMetrics } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RefineIcon, DownloadIcon } from './icons';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface OutputDisplayProps {
  result: GenerationResult | null;
  selectedType: ContentType;
  isLoading: boolean;
  isRefining: boolean;
  onRefine: (instruction: string) => void;
}

const WelcomeMessage: React.FC = () => (
    <div className="text-center p-12 border-2 border-dashed border-base-300 rounded-2xl">
        <h3 className="text-2xl font-bold text-text-primary">Welcome to MktngGen.AI</h3>
        <p className="mt-2 text-content">Select a content type and fill out the form to generate your marketing materials.</p>
        <p className="mt-4 text-sm text-gray-400">Your results will appear here.</p>
    </div>
);


const LoadingIndicator: React.FC = () => (
    <div className="text-center p-12 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-2xl font-bold text-text-primary mt-4">Generating Content...</h3>
        <p className="mt-2 text-content">Our AI is crafting your materials. This may take a moment.</p>
    </div>
);

const ConceptDetail: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-content uppercase tracking-wider mb-1">{label}</h4>
        <div className="text-text-primary text-base">{children}</div>
    </div>
);

const PerformanceMetricsDisplay: React.FC<{ metrics: PerformanceMetrics }> = ({ metrics }) => {
  const { generationTime, tokenUsage } = metrics;
  return (
    <div className="mt-6 pt-4 border-t border-base-300 flex items-center justify-end text-xs text-content space-x-4 animate-fade-in">
        <div className="flex items-center space-x-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Time: <strong className="text-text-primary">{generationTime.toFixed(2)}s</strong></span>
        </div>
        {tokenUsage !== undefined && tokenUsage > 0 && (
            <div className="flex items-center space-x-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M9 5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                </svg>
                <span>Tokens: <strong className="text-text-primary">{tokenUsage}</strong></span>
            </div>
        )}
    </div>
  );
};


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ result, selectedType, isLoading, isRefining, onRefine }) => {
  const [copyStatus, setCopyStatus] = useState<string>('Copy Concept');
  const [refineInput, setRefineInput] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy Concept'), 2000);
  };
  
  const handleDownloadText = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType.replace(/\s+/g, '_').toLowerCase()}_content.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadImage = (imageUrl: string) => {
     const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'advertising_poster.jpeg';
    a.click();
  };

  const handleRefineSubmit = () => {
    if (refineInput.trim()) {
      onRefine(refineInput);
      setRefineInput('');
    }
  };

  const handleQuickRefine = (instruction: string) => {
    onRefine(instruction);
  };

  const handleDownloadPdf = async () => {
    if (!result || !result.summaryImageUrl || typeof result.content !== 'string') return;
    setIsDownloadingPdf(true);
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const content = result.content;
        const summaryImageUrl = result.summaryImageUrl;

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pdfWidth - 2 * margin;

        const getImageDimensions = (url: string): Promise<{ w: number, h: number }> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve({ w: img.width, h: img.height });
                img.onerror = reject;
            });
        };

        const { w: imgWidth, h: imgHeight } = await getImageDimensions(summaryImageUrl);
        const ratio = imgWidth / imgHeight;
        let newImgWidth = contentWidth;
        let newImgHeight = newImgWidth / ratio;
        const maxImgHeight = pageHeight * 0.4; // Cap image height to 40% of the page

        if (newImgHeight > maxImgHeight) {
            newImgHeight = maxImgHeight;
            newImgWidth = newImgHeight * ratio;
        }

        const imgX = (pdfWidth - newImgWidth) / 2;
        pdf.addImage(summaryImageUrl, 'JPEG', imgX, margin, newImgWidth, newImgHeight);

        const textY = margin + newImgHeight + 10; // Start text 10mm below image

        // Basic Markdown to plain text conversion for PDF
        let plainText = content
          .replace(/### (.*?)\n/g, '\n$1\n\n')
          .replace(/## (.*?)\n/g, '\n$1\n\n')
          .replace(/# (.*?)\n/g, '\n$1\n\n')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/^- (.*?)\n/g, '• $1\n')
          .replace(/`([^`]+)`/g, '$1');

        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0); // Black text for readability on white bg

        const textLines = pdf.splitTextToSize(plainText, contentWidth);
        pdf.text(textLines, margin, textY);

        pdf.save(`${selectedType.replace(/\s+/g, '_').toLowerCase()}_content.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
    } finally {
        setIsDownloadingPdf(false);
    }
  };

  const renderContent = () => {
    if (isLoading) return <LoadingIndicator />;
    if (!result) return <WelcomeMessage />;

    const { content, summaryImageUrl, performance } = result;
    
    const RefinementSection: React.FC = () => (
      <div className="mt-8 pt-6 border-t border-base-300 animate-fade-in">
        <h4 className="text-lg font-bold text-text-primary mb-3 flex items-center"><RefineIcon /> Refine Your Content</h4>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              placeholder="e.g., Make it more professional"
              className="flex-grow bg-white border border-base-300 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary focus:outline-none transition"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRefineSubmit(); }}
            />
            <button
              onClick={handleRefineSubmit}
              disabled={isRefining}
              className="px-6 py-3 bg-brand-secondary text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isRefining ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Refine'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Make it shorter', 'Make it more professional', 'Add emojis'].map((q) => (
              <button
                key={q}
                onClick={() => handleQuickRefine(q)}
                className="text-xs bg-base-100 hover:bg-brand-secondary text-content hover:text-white px-3 py-1.5 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    if (typeof content === 'string') {
      return (
        <div className="bg-base-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-base-300">
          {summaryImageUrl && (
            <div className="relative group">
              <img src={summaryImageUrl} alt="Generated Content Summary" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300">
                <h3 className="text-white text-2xl font-bold">Content Preview</h3>
              </div>
            </div>
          )}
          <div>
            <div className="p-8">
              <div className="prose max-w-none prose-p:text-content prose-headings:text-text-primary prose-strong:text-text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="p-8 pt-0">
            <div className="flex items-center space-x-2 mt-4">
                <button
                    onClick={() => handleDownloadText(content)}
                    className="flex-1 text-sm bg-base-200 border border-base-300 hover:bg-base-100 text-text-primary px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                    <DownloadIcon />
                    <span>Download .txt</span>
                </button>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="flex-1 text-sm bg-base-200 border border-base-300 hover:bg-base-100 text-text-primary px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                   <DownloadIcon />
                    <span>{isDownloadingPdf ? 'Downloading...' : 'Download .pdf'}</span>
                </button>
            </div>
            {performance && <PerformanceMetricsDisplay metrics={performance} />}
            <RefinementSection />
          </div>
        </div>
      );
    }
    
    // AD_POSTER type
    const poster = content as PosterContent;
    const conceptText = `Campaign: ${poster.concept.campaign}\nHeadline: ${poster.concept.headline}\nVisual Concept: ${poster.concept.visualConcept}\nColor Palette: ${poster.concept.colorPalette}\nTypography: ${poster.concept.typography}\nLayout: ${poster.concept.layout}\nCall to Action: ${poster.concept.cta}`;

    return (
        <div className="bg-base-200 rounded-2xl shadow-xl p-8 animate-fade-in border border-base-300">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex-shrink-0">
                    <img src={poster.imageUrl} alt={poster.concept.headline} className="rounded-lg shadow-2xl w-full" />
                    <button
                        onClick={() => handleDownloadImage(poster.imageUrl)}
                        className="w-full mt-4 text-sm bg-base-200 border border-base-300 hover:bg-base-100 text-text-primary px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                         <DownloadIcon />
                        <span>Download Image</span>
                    </button>
                </div>
                <div className="md:w-2/3 space-y-5">
                    <ConceptDetail label="Campaign">{poster.concept.campaign}</ConceptDetail>
                    <ConceptDetail label="Headline">{poster.concept.headline}</ConceptDetail>
                    <ConceptDetail label="Visual Concept"><p className="whitespace-pre-wrap">{poster.concept.visualConcept}</p></ConceptDetail>
                    <ConceptDetail label="Color Palette">{poster.concept.colorPalette}</ConceptDetail>
                    <ConceptDetail label="Typography">{poster.concept.typography}</ConceptDetail>
                    <ConceptDetail label="Layout">{poster.concept.layout}</ConceptDetail>
                    <ConceptDetail label="Call to Action">{poster.concept.cta}</ConceptDetail>
                    <div className="flex items-center space-x-2 pt-2">
                        <button
                            onClick={() => handleCopy(conceptText)}
                            className="flex-1 text-sm bg-base-100 hover:bg-base-300 text-text-primary px-4 py-2 rounded-lg transition-colors"
                        >
                           {copyStatus}
                        </button>
                         <button
                            onClick={() => handleDownloadText(conceptText)}
                            className="flex-1 text-sm bg-base-100 hover:bg-base-300 text-text-primary px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <DownloadIcon />
                            <span>Download .txt</span>
                        </button>
                    </div>
                </div>
            </div>
            {performance && <PerformanceMetricsDisplay metrics={performance} />}
        </div>
    );
  };

  return <>{renderContent()}</>;
};