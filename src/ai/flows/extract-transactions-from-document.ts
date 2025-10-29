'use server';

/**
 * @fileOverview This flow is a placeholder for extracting transactions.
 * It is not fully implemented as it requires a non-Genkit AI service.
 */

import type {
  ExtractTransactionsInput,
  ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';
import catalystService from '@/services/catalyst';

const PROMPT_TEMPLATE = `You are an expert at extracting structured data from financial documents.
Analyze the provided document and extract all financial transactions you can find.
The document is provided as a data URI.

Document: {{media url=documentDataUri}}

For each transaction, provide:
- "description": A clear description of the transaction.
- "date": The date in DD/MM/YYYY format.
- "type": "income" or "expense".
- "amount": The transaction amount, formatted as a string with currency (e.g., "INR 1,234.56").

Your response MUST be a valid JSON object that conforms to the output schema.
`;

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  // This is a placeholder implementation.
  // The actual implementation would involve formatting the prompt
  // and sending it to a capable multimodal LLM via a service similar to catalystService.
  console.warn(
    'extractTransactionsFromDocument is a placeholder and not fully implemented.'
  );

  // For now, we return an empty list of transactions.
  // To implement this, you would need a service that can handle multimodal inputs
  // and provide structured JSON output, then parse the response.
  try {
    // This is a conceptual example of how it might work if catalystService supported it.
    // const response = await catalystService.getStructuredAnswer({ query: PROMPT_TEMPLATE, documents: [input.documentDataUri]});
    // return JSON.parse(response);
    return { transactions: [] };
  } catch (error: any) {
     throw new Error(
      `Failed to extract transactions: ${error.message}`
    );
  }
}
