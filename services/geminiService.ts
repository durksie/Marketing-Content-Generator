import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, MarketingInputs, PosterContent, PosterConcept } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface TextGenerationResponse {
  text: string;
  tokenUsage: number;
}

const handleApiError = (error: any): Error => {
  const message = error.message || 'An unknown error occurred.';
  
  if (message.includes('API key not valid')) {
    return new Error('The provided API Key is invalid. Please check your environment configuration.');
  }
  if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
    return new Error('You are making too many requests. Please wait a moment and try again.');
  }
  if (message.includes('quota') || message.toLowerCase().includes('resource has been exhausted')) {
    return new Error('You have exceeded your API usage quota. Please check your Google AI Studio account.');
  }
  if (message.includes('500') || message.includes('503')) {
      return new Error('The AI service is currently unavailable. Please try again later.');
  }
  
  if (error instanceof Error) {
    return error;
  }
  
  return new Error('An unexpected error occurred while communicating with the AI service.');
};

const checkResponseForIssues = (response: any): void => {
    if (!response.candidates || response.candidates.length === 0 || !response.text) {
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason) {
            switch (finishReason) {
                case 'SAFETY':
                    throw new Error("The response was blocked due to safety concerns. Please adjust your inputs.");
                case 'RECITATION':
                    throw new Error("The response was blocked to prevent recitation of existing content. Please rephrase your request.");
                case 'MAX_TOKENS':
                    throw new Error("The request is too long or the response would exceed the maximum length. Please shorten your input.");
                default:
                    throw new Error(`The AI failed to generate a response due to an unhandled reason: ${finishReason}.`);
            }
        }
        if (!response.text) {
             throw new Error("The AI returned an empty response. Please try again with a different prompt.");
        }
    }
}


const generatePrompt = (contentType: ContentType, inputs: MarketingInputs): string | { systemInstruction: string; prompt: string } => {
  const { businessType, targetAudience, brandPersonality, campaignObjective, additionalInfo, platform } = inputs;
  const baseDetails = `
    - Business Type: ${businessType}
    - Target Audience: ${targetAudience}
    - Brand Personality: ${brandPersonality}
    - Campaign Objective: ${campaignObjective}
    ${additionalInfo ? `- Additional Information: ${additionalInfo}` : ''}
  `;

  switch (contentType) {
    case ContentType.SOCIAL_MEDIA:
        const socialSystemInstruction = `You are a viral social media strategist and content creator with expertise across all platforms.`;
        const socialPrompt = `Create engaging social media captions for ${platform} promoting ${campaignObjective} for ${businessType} with ${brandPersonality} tone.

REQUIREMENTS:
- Platform-specific optimization for ${platform}
- Include 3 caption variations (short, medium, long)
- Add relevant hashtags (5-8 per variation)
- Incorporate trending audio/sound references if applicable
- Include clear call-to-action
- Adapt for ${brandPersonality} tone

PLATFORM SPECIFICS:
- Instagram: Carousel captions, Reels hooks, Story engagement
- TikTok: Viral hooks, trending sounds, duet challenges
- Twitter: Thread starters, engagement questions
- Facebook: Community-building, shareable content
- LinkedIn: Professional tone, industry insights

FORMAT:
**Platform:** ${platform}
**Primary Caption:** [2-3 sentences with hook]
**Alternative Versions:** [2 additional variations]
**Hashtags:** [Platform-optimized mix]
**CTA:** [Clear action instruction]
**Trending Elements:** [Current viral references]

Business Type: ${businessType}
Product/Service: ${campaignObjective}
Brand Voice: ${brandPersonality}
Target Audience: ${targetAudience}`;
      return { systemInstruction: socialSystemInstruction, prompt: socialPrompt };
    case ContentType.AD_POSTER:
      const posterSystemInstruction = `You are a creative director and visual marketing expert with 15+ years in advertising. Your task is to generate a complete advertising poster concept.`;
      const posterPrompt = `Generate a complete advertising poster concept for a business of type "${inputs.businessType}" promoting "${inputs.campaignObjective}".

Use the following details:
- Design Style: ${inputs.designStyle}
- Target Audience: ${inputs.targetAudience}
- Campaign Goal: ${inputs.campaignObjective}
- Brand Voice: ${inputs.brandPersonality}
- Campaign Name: ${inputs.campaignName}
- Urgency Level: ${inputs.urgency}
${inputs.negativePrompt ? `- Negative Prompt (exclusions for the visual): ${inputs.negativePrompt}` : ''}
${inputs.additionalInfo ? `- Additional Information: ${inputs.additionalInfo}` : ''}

The concept should include:
1.  HEADLINE: Attention-grabbing, benefit-focused (3-5 words)
2.  VISUAL DESCRIPTION: Specific imagery, colors, composition for the poster's visual. This will be used to generate an image, so be descriptive and concrete. Adhere to any negative prompt exclusions.
3.  COLOR PALETTE: 3-5 primary colors with hex codes as a string.
4.  TYPOGRAPHY: Font suggestions with reasoning as a string.
5.  LAYOUT: Composition and element placement description as a string.
6.  CALL-TO-ACTION (CTA): Clear, urgent, compelling.

Return the response as a single, valid JSON object with the following keys: "campaign", "headline", "visualConcept", "colorPalette", "typography", "layout", "cta". Do not include any other text or markdown formatting outside of the JSON object.
`;
      return { systemInstruction: posterSystemInstruction, prompt: posterPrompt };
    case ContentType.TREND_ANALYSIS:
      const trendSystemInstruction = `You are a market research analyst and trend forecasting expert.`;
      const trendPrompt = `Provide a current marketing trend analysis for the ${inputs.businessType} industry with actionable insights for ${inputs.businessSize} businesses.

TREND REPORT STRUCTURE:
1. EXECUTIVE SUMMARY: 3 key trends impacting ${inputs.businessType}
2. CONSUMER BEHAVIOR: Shifting preferences and expectations in ${inputs.targetRegion}
3. TECHNOLOGY TRENDS: Emerging tools and platforms
4. CONTENT STRATEGIES: What's working right now
5. COMPETITIVE LANDSCAPE: What leaders are doing
6. ACTIONABLE RECOMMENDATIONS: 5 immediate steps

DATA POINTS TO INCLUDE:
- Current viral content patterns
- Algorithm changes on major platforms
- Consumer sentiment shifts
- Seasonal opportunities
- Emerging competitor strategies
- ROI metrics for different channels

FORMAT:
**Industry Overview:** ${inputs.businessType} current state
**Top 3 Trends:** [Trend name, impact level, timeline]
**Opportunity Analysis:** [Specific to ${inputs.businessSize}]
**Threat Assessment:** [Risks to monitor]
**Immediate Actions:** [30-60-90 day plan]
**Key Metrics:** [What to track]

Business Size: ${inputs.businessSize}
Timeframe: ${inputs.timeframe}
Region: ${inputs.targetRegion}
`;
      return { systemInstruction: trendSystemInstruction, prompt: trendPrompt };
    case ContentType.WEBSITE_ADVICE:
      const webSystemInstruction = `You are a web development strategist and conversion rate optimization expert.`;
      const webPrompt = `Provide comprehensive website development advice for a ${inputs.businessType} targeting ${inputs.targetAudience} with a ${inputs.budgetRange} budget.

WEBSITE STRATEGY COMPONENTS:
1. PLATFORM SELECTION: CMS recommendations for a ${inputs.businessSize} business.
2. UX/UI CONSIDERATIONS: Design specific to the ${inputs.targetAudience} audience.
3. CONTENT ARCHITECTURE: Page structure and user flow.
4. TECHNICAL REQUIREMENTS: SEO, speed, mobile optimization.
5. CONVERSION FUNNELS: Lead generation and sales optimization based on the primary goal of ${inputs.primaryGoal}.
6. BUDGET ALLOCATION: A spending plan for a ${inputs.budgetRange} budget.

SPECIFIC GUIDANCE FOR:
- E-commerce vs service business needs
- Local business vs global reach requirements
- B2B vs B2C conversion strategies
- Mobile-first design imperatives
- Accessibility compliance standards

FORMAT:
**Business Profile:** ${inputs.businessType} specific needs
**Platform Recommendation:** [CMS with pros/cons]
**Key Pages:** [Essential page structure]
**Conversion Strategy:** [Lead/sales funnel design]
**Technical Checklist:** [Must-have features]
**Budget Breakdown:** [Allocation recommendations]
**Timeline:** [Development phases]

Primary Goal: ${inputs.primaryGoal}
Project Timeline: ${inputs.projectTimeline}
Technical Level of Client: ${inputs.techExpertise}
`;
      return { systemInstruction: webSystemInstruction, prompt: webPrompt };
    case ContentType.MARKETING_STRATEGY:
      const strategySystemInstruction = `You are a chief marketing officer with 20+ years experience scaling businesses.`;
      const strategyPrompt = `Develop a comprehensive 360° marketing strategy for a ${inputs.businessType} targeting the ${inputs.targetAudience} market segment with ${inputs.budgetConstraints} budget constraints.

STRATEGY COMPONENTS:
1. SITUATION ANALYSIS: SWOT and competitive landscape
2. TARGET AUDIENCE: Detailed buyer personas (3 types)
3. MARKETING OBJECTIVES: SMART goals for the ${inputs.strategyTimeline} timeline
4. CHANNEL STRATEGY: Platform selection and allocation
5. CONTENT CALENDAR: 30-day detailed plan
6. BUDGET ALLOCATION: Optimization for ${inputs.budgetConstraints}
7. KPI FRAMEWORK: Measurement and optimization plan

INCLUDE:
- Digital vs traditional media mix
- Organic vs paid strategy balance
- Conversion funnel mapping
- Customer journey optimization
- ROI projection and benchmarks

FORMAT:
**Executive Summary:** [Key strategy highlights]
**Target Personas:** [3 detailed profiles]
**Channel Plan:** [Platform-specific tactics]
**Content Calendar:** [Daily activities for 30 days]
**Budget Plan:** [Allocation and expected ROI]
**Success Metrics:** [KPIs and measurement]

Business Stage: ${inputs.businessStage}
Timeline: ${inputs.strategyTimeline}
Primary Goal: ${inputs.primaryObjective}
`;
      return { systemInstruction: strategySystemInstruction, prompt: strategyPrompt };
    case ContentType.EMAIL_CAMPAIGN:
      return `Write a sequence of 3 marketing emails for a campaign. Include a compelling subject line for each email. The sequence should be: 1. Introduction, 2. Value Proposition/Follow-up, 3. Call to Action. Format the output as Markdown with clear separation for each email.
      ${baseDetails}`;
    case ContentType.BRAND_VOICE:
        const voiceSystemInstruction = `You are a brand strategist and messaging architect specializing in brand positioning.`;
        const voicePrompt = `Create a complete brand voice and messaging guide for a ${inputs.businessType} in the ${inputs.businessType} industry targeting ${inputs.targetAudience}.

BRAND GUIDE COMPONENTS:
1. BRAND PERSONALITY: 5 core personality traits
2. TONE VARIATIONS: Formal, casual, emotional, technical adaptions
3. MESSAGING PILLARS: 3-5 core value propositions
4. VOICE EXAMPLES: Do's and Don'ts for different contexts
5. STORYTELLING FRAMEWORK: Brand narrative structure
6. VISUAL-VERBAL ALIGNMENT: How voice complements visual identity

SPECIFIC ELEMENTS:
- Mission statement refinement
- Value proposition crafting
- Tagline development (5 options)
- Elevator pitch variations
- Social media voice adaptation
- Customer service tone guidelines

FORMAT:
**Brand Archetype:** [Primary and secondary archetypes]
**Personality Traits:** [5 traits with explanations]
**Tone Guide:** [Context-specific adaptations]
**Messaging Framework:** [Core messages and proof points]
**Communication Examples:** [Real-world applications]
**Style Guide:** [Grammar and word choice preferences]

Industry: ${inputs.businessType}
Competitive Landscape: ${inputs.competitionLevel}
Brand Evolution Goal: ${inputs.desiredPerception}`;
      return { systemInstruction: voiceSystemInstruction, prompt: voicePrompt };
    case ContentType.CONTENT_IMPROVER:
      const improverSystemInstruction = `You are a marketing director and quality assurance specialist for AI-generated content. Your task is to analyze, critique, and rewrite user-submitted content to elevate it to a professional, high-impact standard.`;
      const improverPrompt = `Critique and rewrite the following marketing content to better align with the specified goals.

**Content for Improvement:**
---
${inputs.existingContent}
---

**Context & Goals:**
- Business Type: ${inputs.businessType}
- Target Audience: ${inputs.targetAudience}
- Brand Personality: ${inputs.brandPersonality}
- Primary Improvement Goal: ${inputs.improvementGoal}
${inputs.campaignObjective ? `- Original Campaign Objective: ${inputs.campaignObjective}` : ''}

**Analysis & Rewrite Instructions:**
1.  **Critique:** Provide a brief, constructive critique of the original content. Identify 2-3 specific areas for improvement (e.g., clarity, tone, CTA, persuasiveness).
2.  **Rewrite:** Provide a rewritten, improved version of the content that directly addresses the critique and the primary improvement goal.
3.  **Justification:** Briefly explain *why* the changes were made, connecting them back to marketing best practices and the provided context.

**FORMAT:**
**Critique:**
- [Point 1]
- [Point 2]

**Improved Content:**
[Rewritten version of the content]

**Rationale for Changes:**
- **[Change 1]:** [Explanation]
- **[Change 2]:** [Explanation]
`;
      return { systemInstruction: improverSystemInstruction, prompt: improverPrompt };
    default:
      throw new Error('Unknown content type');
  }
};

export const generateTextContent = async (contentType: ContentType, inputs: MarketingInputs): Promise<TextGenerationResponse> => {
  try {
    const promptPayload = generatePrompt(contentType, inputs);
    const useSearch = contentType === ContentType.TREND_ANALYSIS;
    
    let systemInstruction: string | undefined;
    let prompt: string;

    if (typeof promptPayload === 'string') {
      prompt = promptPayload;
    } else {
      prompt = promptPayload.prompt;
      systemInstruction = promptPayload.systemInstruction;
    }
    
    const config: { tools?: any[], systemInstruction?: string, responseMimeType?: string, responseSchema?: any } = {};
    if (useSearch) {
      config.tools = [{googleSearch: {}}];
    }

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    
    if (contentType === ContentType.AD_POSTER) {
        config.responseMimeType = "application/json";
        config.responseSchema = {
            type: Type.OBJECT,
            properties: {
              campaign: { type: Type.STRING },
              headline: { type: Type.STRING },
              visualConcept: { type: Type.STRING },
              colorPalette: { type: Type.STRING },
              typography: { type: Type.STRING },
              layout: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
            required: ["campaign", "headline", "visualConcept", "colorPalette", "typography", "layout", "cta"],
        }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      ...(Object.keys(config).length > 0 && { config })
    });
    
    checkResponseForIssues(response);

    const tokenUsage = response.usageMetadata?.totalTokenCount ?? 0;
    let text = response.text.trim();
    
    if (contentType === ContentType.AD_POSTER) {
      if (text.startsWith('```json')) {
        text = text.substring(7);
      }
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
    }

    return { text, tokenUsage };
  } catch(e) {
    throw handleApiError(e);
  }
};

export const generatePosterContent = async (inputs: MarketingInputs, concept: PosterConcept): Promise<PosterContent> => {
  try {
    let imagePrompt = `${concept.visualConcept}. The poster should be for a ${inputs.businessType} and reflect a ${inputs.brandPersonality} brand personality. The overall style should be ${inputs.designStyle}. Do not include any text in the image.`;

    if (inputs.negativePrompt) {
      imagePrompt += ` Do not include: ${inputs.negativePrompt}.`;
    }
    
    const imageConfig = {
      numberOfImages: 1,
      aspectRatio: '9:16',
      outputMimeType: 'image/jpeg'
    };
    
    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: imageConfig
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error('Image generation failed to produce an image. This might be due to a safety policy violation. Please adjust your prompt.');
    }

    const base64Image = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return { concept, imageUrl };
  } catch(e) {
    throw handleApiError(e);
  }
};

export const generateSummaryImage = async (textContent: string): Promise<{ imageUrl: string; tokenUsage: number; }> => {
  try {
    const imagePromptGenPrompt = `Summarize the following marketing content into a single, concise sentence that describes an abstract, professional, digital art image. This sentence will be used as a prompt for an AI image generator to create a visual representation of the content's core theme and tone. Do not include any introductory phrases.

  CONTENT:
  ---
  ${textContent.substring(0, 1000)}
  ---
  `;

    const promptResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: imagePromptGenPrompt,
    });

    checkResponseForIssues(promptResponse);
    const imagePrompt = promptResponse.text.trim();
    const tokenUsage = promptResponse.usageMetadata?.totalTokenCount ?? 0;

    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error('Summary image generation failed. This could be due to safety filters on the summarized prompt.');
    }

    const base64Image = imageResponse.generatedImages[0].image.imageBytes;
    return { imageUrl: `data:image/jpeg;base64,${base64Image}`, tokenUsage };
  } catch(e) {
    throw handleApiError(e);
  }
};

export const refineTextContent = async (originalContent: string, refinementInstruction: string): Promise<TextGenerationResponse> => {
  try {
    const systemInstruction = `You are an expert content editor and copywriter. Your task is to refine and rewrite the provided text based on a specific user instruction.
  Return only the refined text, without any additional commentary, introductory phrases, or markdown formatting. The output should be ready to be used directly.`;

    const prompt = `Please refine the following text based on my instruction.

  **INSTRUCTION:**
  ---
  ${refinementInstruction}
  ---

  **ORIGINAL TEXT:**
  ---
  ${originalContent}
  ---

  **REFINED TEXT:**`;
    
    const response = await ai.models.generateContent({
      // FIX: Corrected model name from 'gem-2.5-flash' to 'gemini-2.5-flash'.
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          systemInstruction,
      }
    });
    
    checkResponseForIssues(response);
    const tokenUsage = response.usageMetadata?.totalTokenCount ?? 0;
    return { text: response.text.trim(), tokenUsage };
  } catch(e) {
    throw handleApiError(e);
  }
};