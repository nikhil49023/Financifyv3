
'use server';

/**
 * @fileOverview A flow for generating a full Detailed Project Report (DPR) from an elaborated business profile.
 * This has been refactored to use a non-Genkit service.
 */

import catalystService from '@/services/catalyst';
import type {
  ElaboratedBusinessProfile,
  GenerateDprOutput,
} from '@/ai/schemas/dpr';

const PROMPT_TEMPLATE = `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with a detailed, structured business profile. Your task is to write the complete DPR based on this information.

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the final DPR output schema (GenerateDprOutputSchema). Do not include any other text, markdown, or explanations.
Every string field in the output must start with "*(Powered by FIn-Box AI)*".

For the "financialProjections" section, you must generate the full financial object with credible, realistic data based on the business profile.
The 'costBreakdown' and 'yearlyProjections' fields must be valid JSON arrays for charts.
All other fields should be markdown strings, providing detailed and well-structured content for each section of the DPR.

**Detailed Business Profile Input:**
{{BUSINESS_PROFILE}}

Based on this profile, generate the complete JSON object for the DPR.
`;

export async function generateDprFromElaboration(
  input: ElaboratedBusinessProfile
): Promise<GenerateDprOutput> {
  const prompt = PROMPT_TEMPLATE.replace(
    '{{BUSINESS_PROFILE}}',
    JSON.stringify(input, null, 2)
  );

  try {
    const rawResponse = await catalystService.getRagAnswer({ query: prompt });
    // The AI might return the JSON wrapped in markdown, so we need to clean it.
    const jsonString = rawResponse.replace(/```json\n|```/g, '').trim();
    const parsedOutput = JSON.parse(jsonString);
    return parsedOutput;
  } catch (error: any) {
    console.error('Failed to parse full DPR from AI:', error);
    throw new Error(
      `Failed to generate the full DPR. The AI response was not valid JSON. Response: ${error.message}`
    );
  }
}
