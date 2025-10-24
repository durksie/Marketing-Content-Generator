import { ContentType, MarketingInputs } from './types';
import { getInitialInputs } from './utils';

export interface PromptTemplate {
  name: string;
  description: string;
  contentType: ContentType;
  inputs: MarketingInputs;
}

const baseInputs = getInitialInputs();

export const promptTemplates: PromptTemplate[] = [
  {
    name: 'Sustainable Fashion Launch',
    description: 'Generate captions for a new eco-friendly clothing line launch on Instagram.',
    contentType: ContentType.SOCIAL_MEDIA,
    inputs: {
      ...baseInputs,
      platform: 'Instagram',
      businessType: 'Sustainable Fashion E-commerce',
      targetAudience: 'Eco-conscious millennials aged 25-40 in urban areas',
      brandPersonality: 'Inspirational & Uplifting',
      campaignObjective: 'Launch our new 100% organic cotton summer collection',
      additionalInfo: 'Highlight our plastic-free packaging and carbon-neutral shipping.',
    }
  },
  {
    name: 'Restaurant Flash Sale',
    description: 'Create a visually striking poster concept for a limited-time restaurant deal.',
    contentType: ContentType.AD_POSTER,
    inputs: {
        ...baseInputs,
        businessType: 'Local Pizzeria',
        targetAudience: 'Students and young professionals looking for a quick, affordable dinner deal.',
        brandPersonality: 'Friendly & Approachable',
        campaignObjective: 'Promote our "Two-for-One Tuesday" pizza deal.',
        campaignName: 'Two-for-One Tuesdays',
        designStyle: 'Bold & Graphic',
        urgency: 'High',
        additionalInfo: 'Use vibrant, appetizing colors. The poster should feel energetic and fun.',
        negativePrompt: 'blurry, dark, sad colors, empty restaurant'
    }
  },
  {
    name: 'AI in Marketing Report',
    description: 'Analyze current trends in AI for small marketing agencies.',
    contentType: ContentType.TREND_ANALYSIS,
    inputs: {
        ...baseInputs,
        businessType: 'Digital Marketing',
        businessSize: 'Small Business (1-50 employees)',
        timeframe: 'Next 6 Months',
        targetRegion: 'Global',
        targetAudience: 'Marketing managers at small to medium-sized businesses.',
        campaignObjective: 'Understand the impact and opportunities of Generative AI in content creation and automation.',
    }
  },
  {
    name: 'Photographer Portfolio Site',
    description: 'Get advice for building a portfolio website for a freelance wedding photographer.',
    contentType: ContentType.WEBSITE_ADVICE,
    inputs: {
        ...baseInputs,
        businessType: 'Freelance Wedding Photography',
        targetAudience: 'Engaged couples aged 28-40 planning their wedding.',
        brandPersonality: 'Luxurious & Sophisticated',
        budgetRange: '<$5,000',
        primaryGoal: 'Lead Generation',
        projectTimeline: '1-3 Months',
        techExpertise: 'Beginner (No-code preferred)',
        campaignObjective: 'Create an elegant, visually-driven portfolio website to attract high-end clients.',
    }
  },
  {
    name: 'B2B SaaS Market Entry',
    description: 'Develop a 6-month marketing strategy for a new SaaS product entering the market.',
    contentType: ContentType.MARKETING_STRATEGY,
    inputs: {
        ...baseInputs,
        businessType: 'B2B SaaS (Project Management Tool)',
        targetAudience: 'Tech startups and small development teams (10-50 people).',
        brandPersonality: 'Professional & Authoritative',
        businessStage: 'Startup (Pre-launch)',
        strategyTimeline: '6 Months',
        primaryObjective: 'User Engagement',
        budgetConstraints: 'Moderate ($5k-$25k/mo)',
        campaignObjective: 'Successfully launch and acquire the first 1,000 active users.',
    }
  },
  {
    name: 'Improve Blog Post Intro',
    description: 'Rewrite a bland blog post introduction to be more engaging and persuasive for SEO.',
    contentType: ContentType.CONTENT_IMPROVER,
    inputs: {
        ...baseInputs,
        businessType: 'Financial Advisory Firm',
        targetAudience: 'Young professionals planning for retirement.',
        brandPersonality: 'Professional & Authoritative',
        improvementGoal: 'Increase persuasiveness and conversion',
        existingContent: 'Retirement planning is a crucial step for financial security. It involves setting goals and creating a strategy to meet them. In this article, we will discuss various retirement savings options available to you.',
    }
  }
];
