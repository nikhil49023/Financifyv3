'use server';

/**
 * @fileOverview A flow for answering questions using the Firebase AI SDK.
 */
import {initializeApp, getApps} from 'firebase/app';
import {getAI, getGenerativeModel, GoogleAIBackend} from 'firebase/ai';
import {app} from '@/lib/firebase';
import type {
  GenerateRagAnswerInput,
  GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {model: 'gemini-pro'});

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  const context = `
    CONTEXT:
    The user has the following transactions:
    ${
      input.transactions?.length
        ? input.transactions
            .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
            .join('\n')
        : 'No transactions available.'
    }
  `;

  const prompt = `You are an expert financial advisor. Answer the user's question based on the provided context. Be simple, crisp, and concise.

${context}

QUESTION:
${input.query}
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
