'use server';

/**
 * @fileOverview A flow for elaborating on a user's business idea to create a rich profile for DPR generation.
 */

import {ai} from '@/ai/genkit';
import {
  ElaborationInputSchema,
  ElaboratedBusinessProfileSchema,
} from '@/ai/schemas/dpr';
import type {
  ElaborationInput,
  ElaboratedBusinessProfile,
} from '@/ai/schemas/dpr';

const dprElaborationPrompt = ai.definePrompt({
  name: 'dprElaborationPrompt',
  input: {schema: ElaborationInputSchema},
  output: {schema: ElaboratedBusinessProfileSchema},
  prompt: `You are a business consultant creating a detailed profile for a startup idea in India.
The user has provided a basic idea. Your task is to elaborate on it by filling in the details for a comprehensive business profile.
This profile will be used to generate a full Detailed Project Report (DPR).

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the ElaboratedBusinessProfile schema. Do not include any other text, markdown, or explanations.
Be creative but realistic. Your elaborations should be plausible for the Indian market.

User's Business Idea: "{{idea}}"
Promoter's Name: "{{promoterName}}"

Now, generate the full JSON object for the ElaboratedBusinessProfile. The schema requires these fields: promoterName, businessName, businessType, location, detailedProjectDescription, targetAudienceAnalysis, competitiveLandscape, marketingStrategy, financialSummary, usp.
`,
});

export async function generateDprElaboration(
  input: ElaborationInput
): Promise<ElaboratedBusinessProfile> {
  const {output} = await dprElaborationPrompt(input);
  if (!output) {
    throw new Error(
      'Failed to elaborate on business idea: No output from AI.'
    );
  }
  return output;
}
