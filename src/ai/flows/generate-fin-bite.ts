'use server';

/**
 * @fileOverview This file defines a function for generating "Fin Bites",
 * concise updates on startup schemes and financial news in India, using Genkit and Gemini.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateFinBiteOutputSchema,
  type GenerateFinBiteOutput,
} from '@/ai/schemas/fin-bite';

const finBitePrompt = ai.definePrompt({
  name: 'finBiteGenerator',
  output: {schema: GenerateFinBiteOutputSchema},
  prompt: `You are "FIn-Box," a specialized financial news anchor for early-stage entrepreneurs in India.
Your task is to provide the single latest, most relevant news update for EACH of the following 3 categories: "MSME Schemes", "Finance & Tax", and "Market News".

Your response MUST be a valid JSON object.

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
`,
});

export async function generateFinBite(): Promise<GenerateFinBiteOutput> {
  const {output} = await finBitePrompt();
  if (!output) {
    throw new Error('Failed to generate FinBite updates: No output from AI.');
  }
  return output;
}
