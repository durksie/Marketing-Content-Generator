import { MarketingInputs } from './types';
import { 
    BRAND_PERSONALITIES, DESIGN_STYLES, URGENCY_LEVELS, BUSINESS_SIZES, TIMEFRAMES, 
    BUDGET_RANGES, PRIMARY_GOALS, PROJECT_TIMELINES, TECH_EXPERTISE_LEVELS,
    BUSINESS_STAGES, STRATEGY_TIMELINES, BUDGET_CONSTRAINTS,
    COMPETITION_LEVELS, DESIRED_PERCEPTIONS, IMPROVEMENT_GOALS
} from './constants';

const SOCIAL_MEDIA_PLATFORMS = ['Instagram', 'TikTok', 'Twitter', 'Facebook', 'LinkedIn'];

export const getInitialInputs = (): MarketingInputs => ({
    businessType: '',
    targetAudience: '',
    brandPersonality: BRAND_PERSONALITIES[0],
    campaignObjective: '',
    additionalInfo: '',
    platform: SOCIAL_MEDIA_PLATFORMS[0],
    // Poster
    campaignName: '',
    designStyle: DESIGN_STYLES[0],
    urgency: URGENCY_LEVELS[1],
    negativePrompt: '',
    // Trend / Website
    businessSize: BUSINESS_SIZES[0],
    // Trend
    timeframe: TIMEFRAMES[0],
    targetRegion: '',
    // Website
    budgetRange: BUDGET_RANGES[0],
    primaryGoal: PRIMARY_GOALS[0],
    projectTimeline: PROJECT_TIMELINES[0],
    techExpertise: TECH_EXPERTISE_LEVELS[0],
    // Strategy
    businessStage: BUSINESS_STAGES[0],
    strategyTimeline: STRATEGY_TIMELINES[0],
    primaryObjective: PRIMARY_GOALS[0],
    budgetConstraints: BUDGET_CONSTRAINTS[0],
    // Brand Voice
    competitionLevel: COMPETITION_LEVELS[0],
    desiredPerception: DESIRED_PERCEPTIONS[0],
    // Content Improver
    existingContent: '',
    improvementGoal: IMPROVEMENT_GOALS[0],
});
