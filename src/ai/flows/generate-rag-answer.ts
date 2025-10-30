'use server';
/**
 * @fileOverview A flow for answering questions using the Zoho Catalyst RAG endpoint.
 * It uses a centralized service to handle authentication and API calls.
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
    const answer = await catalystService.getRagAnswer(input);

    if (!answer) {
      throw new Error('Received empty or malformed content from RAG service.');
    }

    return { answer };
  } catch (e: any) {
    console.error('Failed to get response from RAG service:', e);
    throw new Error(`An error occurred while processing the AI response: ${e.message}`);
  }
}
