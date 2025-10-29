
'use server';

/**
 * @fileOverview This file defines a function for generating "Fin Bites",
 * concise updates on startup schemes and financial news in India.
 * This has been refactored to use a non-Genkit service.
 */

import catalystService from '@/services/catalyst';
import type { GenerateFinBiteOutput } from '@/ai/schemas/fin-bite';

const PROMPT_TEMPLATE = `You are "FIn-Box," a specialized financial news anchor for early-stage entrepreneurs in India.
Your task is to provide the single latest, most relevant news update for EACH of the following 3 categories: "MSME Schemes", "Finance & Tax", and "Market News".

Your response MUST be a valid JSON object. Do not include any extra text, markdown, or explanations.

Example Output:
\`\`\`json
{
  "updates": [
    {
      "category": "MSME Schemes",
      "title": "New 'Udyam Assist' Platform Launched",
      "summary": "The government has launched the Udyam Assist Platform to formalize Informal Micro Enterprises (IMEs) and help them avail benefits under Priority Sector Lending."
    },
    {
      "category": "Finance & Tax",
      "title": "GST Council Announces Changes to E-Invoicing",
      "summary": "The threshold for e-invoicing for B2B transactions has been reduced to ₹5 crore, impacting a larger number of small businesses."
    },
    {
      "category": "Market News",
      "title": "SEBI Introduces New Framework for SME IPOs",
      "summary": "The new framework aims to make it easier for small and medium enterprises to raise capital through Initial Public Offerings (IPOs) on the SME platforms of stock exchanges."
    }
  ]
}
\`\`\`
`;

export async function generateFinBite(): Promise<GenerateFinBiteOutput> {
  try {
    const rawResponse = await catalystService.getRagAnswer({
      query: PROMPT_TEMPLATE,
    });
    // The AI might return the JSON wrapped in markdown, so we need to clean it.
    const jsonString = rawResponse.replace(/```json\n|```/g, '').trim();
    const parsedOutput = JSON.parse(jsonString);
    return parsedOutput;
  } catch (error: any) {
    console.error('Failed to parse FinBite updates from AI:', error);
    throw new Error(
      `Failed to generate FinBite updates. The AI response was not valid JSON. Response: ${error.message}`
    );
  }
}
