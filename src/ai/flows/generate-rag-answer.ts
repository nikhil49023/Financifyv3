'use server';

/**
 * @fileOverview A flow for answering questions using the Catalyst RAG service.
 */

import catalystService from '@/services/catalyst';
import type {
  GenerateRagAnswerInput,
  GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  try {
    // The catalystService is already configured to handle the RAG API call.
    const answer = await catalystService.getRagAnswer(input);

    if (!answer) {
      throw new Error('Received an empty response from the AI service.');
    }

    return { answer };
  } catch (error: any) {
    console.error('Error in generateRagAnswer flow:', error);
    // Re-throw the error to be handled by the calling action/API route
    throw new Error(`Failed to get answer from AI: ${error.message}`);
  }
}
