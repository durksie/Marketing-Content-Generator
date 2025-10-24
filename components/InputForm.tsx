import React, { useState } from 'react';
import { MarketingInputs, ContentType } from '../types';
import { 
    BRAND_PERSONALITIES, DESIGN_STYLES, URGENCY_LEVELS, BUSINESS_SIZES, TIMEFRAMES, 
    BUDGET_RANGES, PRIMARY_GOALS, PROJECT_TIMELINES, TECH_EXPERTISE_LEVELS,
    BUSINESS_STAGES, STRATEGY_TIMELINES, BUDGET_CONSTRAINTS,
    COMPETITION_LEVELS, DESIRED_PERCEPTIONS, IMPROVEMENT_GOALS
} from '../constants';
import { CompareIcon, TableIcon } from './icons';

interface InputFormProps {
  onSubmit: (inputs: MarketingInputs) => void;
  isLoading: boolean;
  isGeneratingMatrix: boolean;
  selectedType: ContentType;
  inputs: MarketingInputs;
  onInputsChange: React.Dispatch<React.SetStateAction<MarketingInputs>>;
  historyLength: number;
  onToggleComparison: () => void;
  onGenerateComparisonMatrix: (inputs: MarketingInputs) => void;
}

const SOCIAL_MEDIA_PLATFORMS = ['Instagram', 'TikTok', 'Twitter', 'Facebook', 'LinkedIn'];

const CHAR_LIMITS: Partial<Record<keyof MarketingInputs, number>> = {
    businessType: 150,
    targetAudience: 500,
    campaignObjective: 500,
    additionalInfo: 500,
    campaignName: 100,
    negativePrompt: 200,
    targetRegion: 100,
    existingContent: 3000,
};

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, isGeneratingMatrix, selectedType, inputs, onInputsChange, historyLength, onToggleComparison, onGenerateComparisonMatrix }) => {
  const [errors, setErrors] = useState<Partial<Record<keyof MarketingInputs, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onInputsChange((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof MarketingInputs]) {
        setErrors(prev => ({...prev, [name]: undefined}));
    }
  };
  
  const validateInputs = (): boolean => {
    const newErrors: Partial<Record<keyof MarketingInputs, string>> = {};

    const checkField = (
        field: keyof MarketingInputs, 
        name: string, 
        required: boolean = true
    ) => {
        const value = inputs[field] as string || '';
        const maxLength = CHAR_LIMITS[field];

        if (required && !value.trim()) {
            newErrors[field] = `${name} is required.`;
        } else if (maxLength && value.length > maxLength) {
            newErrors[field] = `${name} cannot exceed ${maxLength} characters.`;
        }
    };

    checkField('businessType', 'Business Type / Industry');
    checkField('targetAudience', 'Target Audience');
    checkField('additionalInfo', 'Additional Information', false);

    if (selectedType !== ContentType.CONTENT_IMPROVER) {
        checkField('campaignObjective', 'Campaign Objective');
    }
    
    if (selectedType === ContentType.AD_POSTER) {
        checkField('campaignName', 'Campaign Name');
        checkField('negativePrompt', 'Negative Prompt', false);
    }
    
    if (selectedType === ContentType.TREND_ANALYSIS) {
        checkField('targetRegion', 'Target Region / Market');
    }
    
    if (selectedType === ContentType.CONTENT_IMPROVER) {
        checkField('existingContent', 'Content to Improve');
        // campaignObjective is optional for this type, but still check length if provided
        checkField('campaignObjective', 'Original Campaign Objective', false);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInputs()) {
      onSubmit(inputs);
    }
  };
  
  const handleComparisonClick = () => {
    if (validateInputs()) {
        onGenerateComparisonMatrix(inputs);
    }
  };

  const isPoster = selectedType === ContentType.AD_POSTER;
  const isSocial = selectedType === ContentType.SOCIAL_MEDIA;
  const isTrendAnalysis = selectedType === ContentType.TREND_ANALYSIS;
  const isWebsiteAdvice = selectedType === ContentType.WEBSITE_ADVICE;
  const isMarketingStrategy = selectedType === ContentType.MARKETING_STRATEGY;
  const isBrandVoice = selectedType === ContentType.BRAND_VOICE;
  const isContentImprover = selectedType === ContentType.CONTENT_IMPROVER;

  const inputClass = (name: keyof MarketingInputs) => 
    `w-full bg-white border text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary focus:outline-none transition ${errors[name] ? 'border-red-500' : 'border-base-300'}`;
  
  const charCounter = (name: keyof MarketingInputs) => {
    const limit = CHAR_LIMITS[name];
    if (!limit) return null;
    const value = inputs[name] || '';
    const length = (value as string).length;
    const isOverLimit = length > limit;
    return (
        <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-text-secondary'}`}>
            {length} / {limit}
        </span>
    );
  };
  
  const FieldFeedback: React.FC<{name: keyof MarketingInputs}> = ({ name }) => (
    <div className="flex justify-between items-start mt-1 h-5">
        <div className="flex-grow">
            {errors[name] && <p className="text-red-500 text-xs">{errors[name]}</p>}
        </div>
        <div className="flex-shrink-0 pl-2">
            {charCounter(name)}
        </div>
    </div>
  );


  return (
    <div className="p-8 bg-base-200 rounded-2xl shadow-lg border border-base-300">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Configure Your Content</h2>
        <p className="text-content mb-6">Provide details about your brand to generate tailored marketing materials for <span className="text-brand-primary font-semibold">{selectedType}</span>.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-text-primary mb-2">{isTrendAnalysis || isBrandVoice ? 'Industry' : 'Business Type / Industry'}</label>
                    <input type="text" name="businessType" id="businessType" value={inputs.businessType} onChange={handleChange} className={inputClass('businessType')} placeholder="e.g., Sustainable Fashion E-commerce" />
                    <FieldFeedback name="businessType" />
                </div>
                 <div>
                    <label htmlFor="brandPersonality" className="block text-sm font-medium text-text-primary mb-2">Brand Personality</label>
                    <select name="brandPersonality" id="brandPersonality" value={inputs.brandPersonality} onChange={handleChange} className={inputClass('brandPersonality')}>
                        {BRAND_PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                {isSocial && (
                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-text-primary mb-2">Social Media Platform</label>
                        <select name="platform" id="platform" value={inputs.platform} onChange={handleChange} className={inputClass('platform')}>
                            {SOCIAL_MEDIA_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                )}
                 {isPoster && (
                   <>
                    <div>
                        <label htmlFor="campaignName" className="block text-sm font-medium text-text-primary mb-2">Campaign Name</label>
                        <input type="text" name="campaignName" id="campaignName" value={inputs.campaignName} onChange={handleChange} className={inputClass('campaignName')} placeholder="e.g., Summer Splash Sale" />
                        <FieldFeedback name="campaignName" />
                    </div>
                    <div>
                        <label htmlFor="designStyle" className="block text-sm font-medium text-text-primary mb-2">Design Style</label>
                        <select name="designStyle" id="designStyle" value={inputs.designStyle} onChange={handleChange} className={inputClass('designStyle')}>
                            {DESIGN_STYLES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="urgency" className="block text-sm font-medium text-text-primary mb-2">Urgency Level</label>
                        <select name="urgency" id="urgency" value={inputs.urgency} onChange={handleChange} className={inputClass('urgency')}>
                            {URGENCY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                   </>
                )}
                 {(isTrendAnalysis || isWebsiteAdvice) && (
                    <div>
                        <label htmlFor="businessSize" className="block text-sm font-medium text-text-primary mb-2">Business Size</label>
                        <select name="businessSize" id="businessSize" value={inputs.businessSize} onChange={handleChange} className={inputClass('businessSize')}>
                            {BUSINESS_SIZES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                )}
                 {isTrendAnalysis && (
                   <>
                     <div>
                        <label htmlFor="timeframe" className="block text-sm font-medium text-text-primary mb-2">Timeframe for Analysis</label>
                        <select name="timeframe" id="timeframe" value={inputs.timeframe} onChange={handleChange} className={inputClass('timeframe')}>
                            {TIMEFRAMES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="targetRegion" className="block text-sm font-medium text-text-primary mb-2">Target Region / Market</label>
                         <input type="text" name="targetRegion" id="targetRegion" value={inputs.targetRegion} onChange={handleChange} className={inputClass('targetRegion')} placeholder="e.g., North America, Global" />
                         <FieldFeedback name="targetRegion" />
                    </div>
                   </>
                )}
                {isWebsiteAdvice && (
                   <>
                    <div>
                        <label htmlFor="budgetRange" className="block text-sm font-medium text-text-primary mb-2">Budget Range</label>
                        <select name="budgetRange" id="budgetRange" value={inputs.budgetRange} onChange={handleChange} className={inputClass('budgetRange')}>
                            {BUDGET_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="primaryGoal" className="block text-sm font-medium text-text-primary mb-2">Primary Goal</label>
                        <select name="primaryGoal" id="primaryGoal" value={inputs.primaryGoal} onChange={handleChange} className={inputClass('primaryGoal')}>
                            {PRIMARY_GOALS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="projectTimeline" className="block text-sm font-medium text-text-primary mb-2">Project Timeline</label>
                         <select name="projectTimeline" id="projectTimeline" value={inputs.projectTimeline} onChange={handleChange} className={inputClass('projectTimeline')}>
                            {PROJECT_TIMELINES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="techExpertise" className="block text-sm font-medium text-text-primary mb-2">Your Technical Expertise</label>
                         <select name="techExpertise" id="techExpertise" value={inputs.techExpertise} onChange={handleChange} className={inputClass('techExpertise')}>
                            {TECH_EXPERTISE_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                   </>
                )}
                {isMarketingStrategy && (
                     <>
                        <div>
                            <label htmlFor="businessStage" className="block text-sm font-medium text-text-primary mb-2">Business Stage</label>
                            <select name="businessStage" id="businessStage" value={inputs.businessStage} onChange={handleChange} className={inputClass('businessStage')}>
                                {BUSINESS_STAGES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="strategyTimeline" className="block text-sm font-medium text-text-primary mb-2">Strategy Timeline</label>
                            <select name="strategyTimeline" id="strategyTimeline" value={inputs.strategyTimeline} onChange={handleChange} className={inputClass('strategyTimeline')}>
                                {STRATEGY_TIMELINES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="primaryObjective" className="block text-sm font-medium text-text-primary mb-2">Primary Objective</label>
                            <select name="primaryObjective" id="primaryObjective" value={inputs.primaryObjective} onChange={handleChange} className={inputClass('primaryObjective')}>
                                {PRIMARY_GOALS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="budgetConstraints" className="block text-sm font-medium text-text-primary mb-2">Budget Constraints</label>
                            <select name="budgetConstraints" id="budgetConstraints" value={inputs.budgetConstraints} onChange={handleChange} className={inputClass('budgetConstraints')}>
                                {BUDGET_CONSTRAINTS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                   </>
                )}
                {isBrandVoice && (
                   <>
                    <div>
                        <label htmlFor="competitionLevel" className="block text-sm font-medium text-text-primary mb-2">Competitive Landscape</label>
                        <select name="competitionLevel" id="competitionLevel" value={inputs.competitionLevel} onChange={handleChange} className={inputClass('competitionLevel')}>
                            {COMPETITION_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="desiredPerception" className="block text-sm font-medium text-text-primary mb-2">Desired Brand Perception</label>
                         <select name="desiredPerception" id="desiredPerception" value={inputs.desiredPerception} onChange={handleChange} className={inputClass('desiredPerception')}>
                            {DESIRED_PERCEPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                   </>
                )}
                {isContentImprover && (
                    <div className="md:col-span-2">
                        <label htmlFor="improvementGoal" className="block text-sm font-medium text-text-primary mb-2">Improvement Goal</label>
                        <select name="improvementGoal" id="improvementGoal" value={inputs.improvementGoal} onChange={handleChange} className={inputClass('improvementGoal')}>
                            {IMPROVEMENT_GOALS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {isContentImprover && (
                <div>
                    <label htmlFor="existingContent" className="block text-sm font-medium text-text-primary mb-2">Content to Improve</label>
                    <textarea name="existingContent" id="existingContent" value={inputs.existingContent} onChange={handleChange} rows={8} className={inputClass('existingContent')} placeholder="Paste your existing marketing copy here..."></textarea>
                    <FieldFeedback name="existingContent" />
                </div>
            )}
            
            {isPoster && (
                <div>
                    <label htmlFor="negativePrompt" className="block text-sm font-medium text-text-primary mb-2">Negative Prompt (Exclusions)</label>
                    <textarea name="negativePrompt" id="negativePrompt" value={inputs.negativePrompt} onChange={handleChange} rows={2} className={inputClass('negativePrompt')} placeholder="e.g., text, logos, people, dark colors"></textarea>
                    <FieldFeedback name="negativePrompt" />
                </div>
            )}

            <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-text-primary mb-2">{
                    isWebsiteAdvice ? 'Audience Segment' : 
                    isMarketingStrategy ? 'Market Segment' : 
                    isBrandVoice ? 'Audience Demographic' : 
                    'Target Audience'
                }</label>
                <textarea name="targetAudience" id="targetAudience" value={inputs.targetAudience} onChange={handleChange} rows={3} className={inputClass('targetAudience')} placeholder="e.g., Eco-conscious millennials aged 25-40 in urban areas"></textarea>
                <FieldFeedback name="targetAudience" />
            </div>
            
            {!isContentImprover &&
                <>
                    <div>
                        <label htmlFor="campaignObjective" className="block text-sm font-medium text-text-primary mb-2">Campaign Objective / Product / Service</label>
                        <textarea name="campaignObjective" id="campaignObjective" value={inputs.campaignObjective} onChange={handleChange} rows={3} className={inputClass('campaignObjective')} placeholder="e.g., Increase online sales by 20% for our new summer collection"></textarea>
                        <FieldFeedback name="campaignObjective" />
                    </div>
                    <div>
                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-text-primary mb-2">Additional Information (Optional)</label>
                        <textarea name="additionalInfo" id="additionalInfo" value={inputs.additionalInfo} onChange={handleChange} rows={2} className={inputClass('additionalInfo')} placeholder="e.g., Mention our '100% organic cotton' materials"></textarea>
                        <FieldFeedback name="additionalInfo" />
                    </div>
                </>
            }
             {isContentImprover &&
                <div>
                    <label htmlFor="campaignObjective" className="block text-sm font-medium text-text-primary mb-2">Original Campaign Objective (Optional)</label>
                    <textarea name="campaignObjective" id="campaignObjective" value={inputs.campaignObjective} onChange={handleChange} rows={2} className={inputClass('campaignObjective')} placeholder="e.g., Promote our new summer collection"></textarea>
                    <FieldFeedback name="campaignObjective" />
                </div>
            }

            <div className="flex justify-end items-center pt-2 space-x-4">
                {historyLength > 1 && (
                     <button 
                        type="button" 
                        onClick={onToggleComparison} 
                        className="px-6 py-3 bg-base-200 border border-base-300 text-text-primary font-bold rounded-lg hover:bg-base-100 transition-colors flex items-center"
                     >
                        <CompareIcon />
                        Compare Iterations
                    </button>
                )}
                <button 
                    type="button" 
                    onClick={handleComparisonClick}
                    disabled={isLoading || isGeneratingMatrix}
                    className="px-6 py-3 bg-base-200 border border-base-300 text-text-primary font-bold rounded-lg hover:bg-base-100 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TableIcon />
                    Comparison Matrix
                </button>
                <button type="submit" disabled={isLoading || isGeneratingMatrix} className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center">
                    {isLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : `Generate Content`}
                </button>
            </div>
        </form>
    </div>
  );
};