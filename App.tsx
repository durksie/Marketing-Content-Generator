import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { PromptLibrary } from './components/PromptLibrary';
import { ContentType, MarketingInputs, GeneratedContent, PosterConcept, GenerationResult } from './types';
import { generateTextContent, generatePosterContent, generateSummaryImage, refineTextContent } from './services/geminiService';
import { FORBIDDEN_KEYWORDS, CONTENT_TYPE_INFO } from './constants';
import { getInitialInputs } from './utils';
import { PromptTemplate } from './promptLibrary';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { MarketingComparisonMatrix, DynamicComparisonRow } from './components/MarketingComparisonMatrix';

const App: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ContentType>(ContentType.SOCIAL_MEDIA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GenerationResult | null>(null);
  const [inputs, setInputs] = useState<MarketingInputs>(getInitialInputs());
  const [generationHistory, setGenerationHistory] = useState<GenerationResult[]>([]);
  const [isComparisonVisible, setIsComparisonVisible] = useState<boolean>(false);
  
  // State for the new dynamic marketing comparison matrix
  const [isMarketingMatrixVisible, setIsMarketingMatrixVisible] = useState<boolean>(false);
  const [isGeneratingMatrix, setIsGeneratingMatrix] = useState<boolean>(false);
  const [comparisonMatrixResults, setComparisonMatrixResults] = useState<DynamicComparisonRow[] | null>(null);


  const filterText = useCallback((text: string): string => {
    let filteredText = text;
    FORBIDDEN_KEYWORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filteredText = filteredText.replace(regex, '****');
    });
    return filteredText;
  }, []);

  const handleSubmit = useCallback(async (currentInputs: MarketingInputs) => {
    const startTime = performance.now();
    let totalTokenUsage = 0;
    
    setIsLoading(true);
    setError(null);
    setGeneratedResult(null);
    setIsComparisonVisible(false);

    try {
      let mainContent: GeneratedContent;
      let textForSummary: string;

      if (selectedType === ContentType.AD_POSTER) {
        const { text: conceptJsonResponse, tokenUsage: conceptTokenUsage } = await generateTextContent(selectedType, currentInputs);
        totalTokenUsage += conceptTokenUsage;
        
        let concept: PosterConcept;
        try {
            concept = JSON.parse(conceptJsonResponse);
        } catch (e) {
            console.error("Failed to parse JSON for poster concept:", e, "Raw response:", conceptJsonResponse);
            throw new Error("AI failed to generate a valid concept structure for the poster.");
        }
        
        const filteredConcept: PosterConcept = {
          ...concept,
          campaign: filterText(concept.campaign),
          headline: filterText(concept.headline),
          visualConcept: filterText(concept.visualConcept),
          cta: filterText(concept.cta),
        };

        const posterResult = await generatePosterContent(currentInputs, concept);
        
        mainContent = { ...posterResult, concept: filteredConcept };
        textForSummary = `Poster concept for '${filteredConcept.campaign}'. Headline: '${filteredConcept.headline}'. It's about ${filteredConcept.visualConcept}`;

      } else {
        const { text: result, tokenUsage } = await generateTextContent(selectedType, currentInputs);
        totalTokenUsage += tokenUsage;
        const filteredResult = filterText(result);
        mainContent = filteredResult;
        textForSummary = filteredResult;
      }

      const { imageUrl: summaryImageUrl, tokenUsage: summaryTokenUsage } = await generateSummaryImage(textForSummary);
      totalTokenUsage += summaryTokenUsage;

      const endTime = performance.now();
      const generationTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));

      const newResult: GenerationResult = {
        content: mainContent,
        summaryImageUrl,
        performance: {
          generationTime,
          tokenUsage: totalTokenUsage,
        },
      };

      setGeneratedResult(newResult);
      setGenerationHistory([newResult]);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, filterText]);
  
  const handleRefine = useCallback(async (instruction: string) => {
    if (!generatedResult || typeof generatedResult.content !== 'string') {
      return;
    }
    
    const startTime = performance.now();
    setIsRefining(true);
    setError(null);

    try {
      const originalContent = generatedResult.content;
      const { text: refined, tokenUsage } = await refineTextContent(originalContent, instruction);
      const filteredRefined = filterText(refined);
      
      const endTime = performance.now();
      const generationTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));

      const refinedResult: GenerationResult = {
        ...generatedResult,
        content: filteredRefined,
        performance: {
          generationTime,
          tokenUsage,
        }
      };

      setGeneratedResult(refinedResult);
      setGenerationHistory(prev => [...prev, refinedResult]);
      setIsComparisonVisible(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during refinement.');
    } finally {
      setIsRefining(false);
    }
  }, [generatedResult, filterText]);
  
  const handleGenerateComparisonMatrix = useCallback(async (currentInputs: MarketingInputs) => {
    setIsGeneratingMatrix(true);
    setError(null);
    setComparisonMatrixResults(null);
    setIsMarketingMatrixVisible(true);

    const typesToCompare: ContentType[] = [
        ContentType.SOCIAL_MEDIA,
        ContentType.EMAIL_CAMPAIGN,
        ContentType.WEBSITE_ADVICE,
    ];

    try {
        const generationPromises = typesToCompare.map(async (type) => {
            const { text, tokenUsage } = await generateTextContent(type, currentInputs);
            const filteredText = filterText(text);
            const { imageUrl } = await generateSummaryImage(filteredText);

            return {
                type: type,
                icon: CONTENT_TYPE_INFO[type].icon,
                features: CONTENT_TYPE_INFO[type].features,
                output: filteredText,
                tokens: tokenUsage,
                visual: imageUrl,
            };
        });

        const results = await Promise.all(generationPromises);
        setComparisonMatrixResults(results);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while generating comparisons.';
        console.error(err);
        setError(errorMessage);
    } finally {
        setIsGeneratingMatrix(false);
    }
  }, [filterText]);
  
  const handleCloseMatrix = () => {
      setIsMarketingMatrixVisible(false);
      setComparisonMatrixResults(null);
      setError(null);
  };

  const handleTypeChange = (type: ContentType) => {
    setSelectedType(type);
    setInputs(getInitialInputs());
    setGeneratedResult(null);
    setError(null);
    setGenerationHistory([]);
    setIsComparisonVisible(false);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedType(template.contentType);
    setInputs(template.inputs);
    setGeneratedResult(null);
    setError(null);
    setGenerationHistory([]);
    setIsComparisonVisible(false);
  };

  const handleRevert = (index: number) => {
    const historyToRevert = generationHistory.slice(0, index + 1);
    const resultToRevert = historyToRevert[historyToRevert.length - 1];
    setGenerationHistory(historyToRevert);
    setGeneratedResult(resultToRevert);
    setIsComparisonVisible(true);
  };
  
  const handleClearHistory = () => {
    if (generatedResult) {
        setGenerationHistory([generatedResult]);
    } else {
        setGenerationHistory([]);
    }
    setIsComparisonVisible(false);
  };


  return (
    <div className="min-h-screen">
      <div className="flex text-content min-h-screen">
        <Sidebar 
          selectedType={selectedType} 
          setSelectedType={handleTypeChange}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <InputForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading} 
              isGeneratingMatrix={isGeneratingMatrix}
              selectedType={selectedType}
              inputs={inputs}
              onInputsChange={setInputs}
              historyLength={generationHistory.length}
              onToggleComparison={() => setIsComparisonVisible(prev => !prev)}
              onGenerateComparisonMatrix={handleGenerateComparisonMatrix}
            />
            {error && !isMarketingMatrixVisible && ( // Only show main error if matrix is not visible
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
              </div>
            )}
            <OutputDisplay 
              result={generatedResult}
              selectedType={selectedType}
              isLoading={isLoading}
              isRefining={isRefining}
              onRefine={handleRefine}
            />
            {isComparisonVisible && (
              <ComparisonMatrix
                history={generationHistory}
                onRevert={handleRevert}
                onClear={handleClearHistory}
                onClose={() => setIsComparisonVisible(false)}
              />
            )}
          </div>
        </main>
      </div>
      <PromptLibrary onSelectTemplate={handleSelectTemplate} />
      {isMarketingMatrixVisible && (
        <MarketingComparisonMatrix 
            isLoading={isGeneratingMatrix}
            results={comparisonMatrixResults}
            error={error}
            onClose={handleCloseMatrix} 
        />
      )}
    </div>
  );
};

export default App;