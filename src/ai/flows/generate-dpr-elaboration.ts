
'use server';

/**
 * @fileOverview A flow for elaborating on a user's business idea to create a rich profile for DPR generation.
 * This has been refactored to use a non-Genkit service.
 */

import catalystService from '@/services/catalyst';
import type {
  ElaborationInput,
  ElaboratedBusinessProfile,
} from '@/ai/schemas/dpr';

const PROMPT_TEMPLATE = `You are a business consultant creating a detailed profile for a startup idea in India.
The user has provided a basic idea. Your task is to elaborate on it by filling in the details for a comprehensive business profile.
This profile will be used to generate a full Detailed Project Report (DPR).

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the ElaboratedBusinessProfile schema. Do not include any other text, markdown, or explanations.
Be creative but realistic. Your elaborations should be plausible for the Indian market.

The schema requires these fields: promoterName, businessName, businessType, location, detailedProjectDescription, targetAudienceAnalysis, competitiveLandscape, marketingStrategy, financialSummary, usp.

User's Business Idea: "{{idea}}"
Promoter's Name: "{{promoterName}}"

Now, generate the full JSON object for the ElaboratedBusinessProfile.
`;

export async function generateDprElaboration(
  input: ElaborationInput
): Promise<ElaboratedBusinessProfile> {
  const prompt = PROMPT_TEMPLATE.replace('{{idea}}', input.idea).replace(
    '{{promoterName}}',
    input.promoterName
  );

  try {
    const rawResponse = await catalystService.getRagAnswer({ query: prompt });
    // The AI might return the JSON wrapped in markdown, so we need to clean it.
    const jsonString = rawResponse.replace(/```json\n|```/g, '').trim();
    const parsedOutput = JSON.parse(jsonString);
    return parsedOutput;
  } catch (error: any) {
    console.error('Failed to parse DPR elaboration from AI:', error);
    throw new Error(
      `Failed to elaborate on business idea. The AI response was not valid JSON. Response: ${error.message}`
    );
  }
}
