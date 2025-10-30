
'use server';
/**
 * @fileOverview A flow for answering questions using Firebase AI.
 * It uses the user's transaction history as context for the AI model.
 */
import {getAI, getGenerativeModel, GoogleAIBackend} from 'firebase/ai';
import {app} from '@/lib/firebase';
import type {
  GenerateRagAnswerInput,
  GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';

const ai = getAI(app, {backend: new GoogleAIBackend()});
const model = getGenerativeModel(ai, {model: 'gemini-2.0-flash-lite-001'});

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  // Convert transactions to a simple text context
  const context =
    input.transactions
      ?.map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
      .join('\n') || 'No transaction history available.';

  const prompt = `You are an expert financial advisor. Answer the user's question based on the provided transaction context. Be simple, crisp, and concise.

    CONTEXT:
    ${context}

    QUESTION:
    ${input.query}

    Your response must be a single string containing only the answer.
  `;

  try {
    const {response} = await model.generateContent(prompt);
    const answer = response.text();
    return {answer};
  } catch (error: any) {
    console.error('Error in generateRagAnswer flow:', error);
    throw new Error(`Failed to get answer from AI: ${error.message}`);
  }
}
