import React from 'react';
import { ContentType } from './types';
import { 
    SocialIcon, PosterIcon, TrendIcon, WebsiteIcon, EmailIcon, 
    StrategyIcon, VoiceIcon, ContentImproverIcon 
} from './components/icons';


export const BRAND_PERSONALITIES = [
  'Friendly & Approachable',
  'Professional & Authoritative',
  'Witty & Humorous',
  'Inspirational & Uplifting',
  'Luxurious & Sophisticated',
  'Bold & Adventurous',
];

export const DESIGN_STYLES = [
  'Minimalist & Clean',
  'Vintage & Retro',
  'Corporate & Professional',
  'Futuristic & Modern',
  'Playful & Whimsical',
  'Elegant & Luxurious',
  'Bold & Graphic',
];

export const URGENCY_LEVELS = ['Low', 'Medium', 'High'];

export const BUSINESS_SIZES = ['Small Business (1-50 employees)', 'Medium Enterprise (51-500 employees)', 'Large Corporation (500+ employees)'];

export const TIMEFRAMES = ['Next 3 Months', 'Next 6 Months', 'Next 12 Months'];

export const BUDGET_RANGES = ['<$5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000+'];
export const PRIMARY_GOALS = ['Lead Generation', 'E-commerce Sales', 'Brand Awareness', 'User Engagement', 'Customer Retention'];
export const PROJECT_TIMELINES = ['1-3 Months', '3-6 Months', '6-12 Months', '12+ Months'];
export const TECH_EXPERTISE_LEVELS = ['Beginner (No-code preferred)', 'Intermediate (Can manage a CMS)', 'Advanced (Comfortable with code)'];

export const BUSINESS_STAGES = ['Startup (Pre-launch)', 'Growth Stage (Scaling)', 'Mature (Established)', 'Decline/Pivot'];
export const STRATEGY_TIMELINES = ['3 Months', '6 Months', '12 Months', '18 Months'];
export const BUDGET_CONSTRAINTS = ['Lean (<$5k/mo)', 'Moderate ($5k-$25k/mo)', 'Aggressive ($25k-$100k/mo)', 'Enterprise (>$100k/mo)'];

export const COMPETITION_LEVELS = ['Low (Niche market)', 'Medium (Established competitors)', 'High (Saturated market)'];
export const DESIRED_PERCEPTIONS = ['Innovative Disruptor', 'Trusted Market Leader', 'Premium & Exclusive', 'Friendly & Accessible', 'Value-Driven & Economical'];

export const IMPROVEMENT_GOALS = [
    'Increase persuasiveness and conversion',
    'Improve brand voice alignment',
    'Enhance clarity and readability',
    'Optimize for a specific platform (e.g., SEO, social media)',
    'Make the tone more engaging',
];

export const CONTENT_TYPE_OPTIONS = Object.values(ContentType);

export const CONTENT_TYPE_INFO: Record<ContentType, { icon: React.ReactNode; features: string; output: string; }> = {
    [ContentType.SOCIAL_MEDIA]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(SocialIcon),
        features: 'Generates platform-specific captions with hashtags and CTAs. Ideal for daily engagement and brand awareness.',
        output: 'Multiple caption variations (short, medium, long) optimized for the selected social media platform.'
    },
    [ContentType.AD_POSTER]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(PosterIcon),
        features: 'Creates a complete visual concept for an advertising poster, including a headline, visual description, and color palette.',
        output: 'A JSON object with a detailed creative brief and a generated image based on the concept.'
    },
    [ContentType.TREND_ANALYSIS]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(TrendIcon),
        features: 'Provides an in-depth analysis of market trends, consumer behavior, and the competitive landscape. Good for strategic planning.',
        output: 'A structured report with an executive summary, actionable recommendations, and key metrics to track.'
    },
    [ContentType.WEBSITE_ADVICE]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(WebsiteIcon),
        features: 'Offers comprehensive advice on website development, including platform selection, UX/UI, and conversion optimization.',
        output: 'A strategic guide covering platform recommendations, key page structures, and a technical checklist.'
    },
    [ContentType.EMAIL_CAMPAIGN]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(EmailIcon),
        features: 'Writes a sequence of marketing emails for a campaign, including compelling subject lines for each email.',
        output: 'A 3-part email sequence (Introduction, Value Proposition, Call to Action) in Markdown format.'
    },
    [ContentType.MARKETING_STRATEGY]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(StrategyIcon),
        features: 'Develops a 360° marketing strategy covering situation analysis, target audience, channel mix, and KPIs.',
        output: 'A comprehensive strategy document including target personas, a content calendar, and budget allocation.'
    },
    [ContentType.BRAND_VOICE]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(VoiceIcon),
        features: 'Creates a complete brand voice and messaging guide to ensure consistent communication across all channels.',
        output: 'A detailed guide including brand personality traits, tone variations, and communication examples.'
    },
    [ContentType.CONTENT_IMPROVER]: {
        // FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
        icon: React.createElement(ContentImproverIcon),
        features: 'Analyzes and rewrites existing content to improve its quality, clarity, and alignment with marketing goals.',
        output: 'A constructive critique, a rewritten version of the content, and a rationale for the changes made.'
    }
};

// A list of keywords to be filtered from the output for brand safety.
// In a real-world application, this list would be more extensive.
export const FORBIDDEN_KEYWORDS = ['profanity', 'inappropriate', 'sensitive-topic'];