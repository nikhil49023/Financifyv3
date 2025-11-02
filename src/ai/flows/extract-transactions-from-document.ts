'use server';
/**
 * @fileOverview A flow for extracting financial transactions from a document.
 * This flow uses the Firebase AI SDK to parse a document image and return structured data.
 */
import {initializeApp, getApps} from 'firebase/app';
import {getAI, getGenerativeModel, GoogleAIBackend} from 'firebase/ai';
import {app} from '@/lib/firebase';
import type {
  ExtractTransactionsInput,
  ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {model: 'gemini-1.5-pro-latest'});

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  const prompt = `You are an expert at extracting structured data from financial documents.
Analyze the provided document and extract all financial transactions you can find.
The document is provided as a data URI.

For each transaction, provide:
- "description": A clear description of the transaction.
- "date": The date in DD/MM/YYYY format.
- "type": "income" or "expense".
- "amount": The transaction amount, formatted as a string with currency (e.g., "INR 1,234.56").

Your response MUST be ONLY a valid JSON object that conforms to the following schema:
{
  "transactions": [
    { "description": "...", "date": "...", "type": "...", "amount": "..." }
  ]
}
Do NOT include any other text, markdown, or explanations.`;

  const {response} = await model.generateContent([
    prompt,
    {inlineData: {data: input.documentDataUri.split(',')[1], mimeType: input.documentDataUri.split(';')[0].split(':')[1]}},
  ]);

  try {
    const text = response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    return parsed as ExtractTransactionsOutput;
  } catch (e) {
    console.error('Failed to parse JSON from model response:', response.text());
    throw new Error('Could not extract transactions. The AI returned an invalid format.');
  }
}
