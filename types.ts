export enum ContentType {
  SOCIAL_MEDIA = 'Social Media Captions',
  AD_POSTER = 'Advertising Poster',
  TREND_ANALYSIS = 'Trend Analysis',
  WEBSITE_ADVICE = 'Website Advice',
  EMAIL_CAMPAIGN = 'Email Campaign',
  MARKETING_STRATEGY = 'Marketing Strategy',
  BRAND_VOICE = 'Brand Voice Guide',
  CONTENT_IMPROVER = 'Content Improver',
}

export interface MarketingInputs {
  businessType: string;
  targetAudience: string;
  brandPersonality: string;
  campaignObjective: string;
  additionalInfo: string;
  platform: string;
  // Poster fields
  designStyle?: string;
  campaignName?: string;
  urgency?: string;
  negativePrompt?: string;
  // Trend Analysis fields
  businessSize?: string;
  timeframe?: string;
  targetRegion?: string;
  // Website Advice fields
  budgetRange?: string;
  primaryGoal?: string;
  projectTimeline?: string;
  techExpertise?: string;
  // Marketing Strategy fields
  businessStage?: string;
  strategyTimeline?: string;
  primaryObjective?: string;
  budgetConstraints?: string;
  // Brand Voice fields
  competitionLevel?: string;
  desiredPerception?: string;
  // Content Improver fields
  existingContent?: string;
  improvementGoal?: string;
}

export interface PosterConcept {
  campaign: string;
  headline: string;
  visualConcept: string;
  colorPalette: string;
  typography: string;
  layout: string;
  cta: string;
}

export interface PosterContent {
  concept: PosterConcept;
  imageUrl: string;
}

export type GeneratedContent = string | PosterContent;

export interface PerformanceMetrics {
  generationTime: number; // in seconds
  tokenUsage?: number;
}

export interface GenerationResult {
  content: GeneratedContent;
  summaryImageUrl?: string;
  performance?: PerformanceMetrics;
}