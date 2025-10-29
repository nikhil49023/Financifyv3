
'use server';

/**
 * @fileOverview A flow for extracting transaction data from a document using Gemini.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractTransactionsInputSchema,
  ExtractTransactionsOutputSchema,
  type ExtractTransactionsInput,
  type ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';

const extractionPrompt = ai.definePrompt(
  {
    name: 'transactionExtractor',
    input: { schema: ExtractTransactionsInputSchema },
    output: { schema: ExtractTransactionsOutputSchema },
    prompt: `You are an expert at extracting structured data from financial documents.
Analyze the provided document and extract all financial transactions you can find.
The document is provided as a data URI.

Document: {{media url=documentDataUri}}

For each transaction, provide:
- "description": A clear description of the transaction.
- "date": The date in DD/MM/YYYY format.
- "type": "income" or "expense".
- "amount": The amount as a string with currency (e.g., "INR 1,234.56").

Your response MUST be a valid JSON object that conforms to the output schema.
`,
  },
);

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  const { output } = await extractionPrompt(input);
  if (!output) {
    throw new Error('Failed to extract transactions: No output from AI.');
  }
  return output;
}
