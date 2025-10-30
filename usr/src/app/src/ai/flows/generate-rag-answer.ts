
'use server';

/**
 * @fileOverview A function for making authenticated requests to the Zoho Catalyst RAG endpoint.
 * This file uses a centralized service to handle authentication and API calls.
 */

import type {
  GenerateRagAnswerInput,
  GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';
import catalystService from '@/services/catalyst';

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  try {
    // Enhance the user's query with instructions for structured output
    const structuredQuery = `You are an expert financial advisor for entrepreneurs in India. 
Your goal is to provide clear, structured, and actionable advice.
When responding to the user's query, use markdown formatting to organize your answer. 
Use headings, bullet points, and bold text to make the information easy to digest.

User's query: "${input.query}"`;

    const modifiedInput: GenerateRagAnswerInput = {
      ...input,
      query: structuredQuery,
    };

    const completion = await catalystService.getRagAnswer(modifiedInput);

    if (!completion) {
      console.error('Received empty or malformed content from RAG service.');
      throw new Error('Received empty or malformed content from RAG service.');
    }

    console.log("Successfully received RAG API response.");
    return { answer: completion };
  } catch (e: any) {
    console.error('Failed to get response from RAG service. Full error:', e);
    throw new Error(`An error occurred while processing the AI response. Check the server logs. Error: ${e.message}`);
  }
}
