'use server';

/**
 * @fileOverview A flow for generating a full Detailed Project Report (DPR) from an elaborated business profile.
 */

import {ai} from '@/ai/genkit';
import {
  ElaboratedBusinessProfileSchema,
  GenerateDprOutputSchema,
} from '@/ai/schemas/dpr';
import type {
  ElaboratedBusinessProfile,
  GenerateDprOutput,
} from '@/ai/schemas/dpr';

const dprGenerationPrompt = ai.definePrompt({
  name: 'dprGenerationPrompt',
  input: {schema: ElaboratedBusinessProfileSchema},
  output: {schema: GenerateDprOutputSchema},
  prompt: `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with a detailed, structured business profile. Your task is to write the complete DPR based on this information.

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the final DPR output schema (GenerateDprOutputSchema). Do not include any other text, markdown, or explanations.
Every string field in the output must start with "*(Powered by FIn-Box AI)*".

For the "financialProjections" section, you must generate the full financial object with credible, realistic data based on the business profile.
The 'costBreakdown' and 'yearlyProjections' fields must be valid JSON arrays for charts.
All other fields should be markdown strings, providing detailed and well-structured content for each section of the DPR.

**Detailed Business Profile Input:**
{{{json input}}}

Based on this profile, generate the complete JSON object for the DPR.
`,
});

export async function generateDprFromElaboration(
  input: ElaboratedBusinessProfile
): Promise<GenerateDprOutput> {
  const {output} = await dprGenerationPrompt(input);
  if (!output) {
    throw new Error('Failed to generate the full DPR: No output from AI.');
  }
  return output;
}
