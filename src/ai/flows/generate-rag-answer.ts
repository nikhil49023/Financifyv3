'use server';
/**
 * @fileOverview A flow for answering questions using Retrieval-Augmented Generation (RAG) with Genkit.
 */
import {ai} from '@/ai/genkit';
import {
  GenerateRagAnswerInputSchema,
  GenerateRagAnswerOutputSchema,
  type GenerateRagAnswerInput,
  type GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';
import {z} from 'zod';
// import {createMemoryRetriever} from 'genkitx-memory';

const financialPrompt = ai.definePrompt(
  {
    name: 'financialPrompt',
    input: {schema: z.object({query: z.string(), context: z.string()})},
    output: {schema: GenerateRagAnswerOutputSchema},
    prompt: `You are an expert financial advisor. Answer the user's question based on the provided context. Be simple, crisp, and concise.

    CONTEXT:
    {{{context}}}

    QUESTION:
    {{{query}}}
  `,
  },
  async input => {
    const llmResponse = await ai.generate({
      prompt: input.prompt,
      model: 'googleai/gemini-2.0-flash-lite-001',
      output: {
        format: 'json',
        schema: GenerateRagAnswerOutputSchema,
      },
    });
    return llmResponse.output!;
  }
);

const generateRagAnswerFlow = ai.defineFlow(
  {
    name: 'generateRagAnswerFlow',
    inputSchema: GenerateRagAnswerInputSchema,
    outputSchema: GenerateRagAnswerOutputSchema,
  },
  async input => {
    // Convert transactions to documents for the retriever
    const documents =
      input.transactions?.map(t => ({
        content: `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`,
      })) || [];

    // RAG with genkitx-memory is causing installation issues. Reverting to simpler context stuffing.
    // const retriever = await createMemoryRetriever(
    //   {
    //     embedder: 'googleai/text-embedding-004',
    //   },
    //   documents
    // );
    // const retrievedDocs = await retriever(input.query);

    // Combine the content of the documents into a single context string
    const context = documents.map(doc => doc.content).join('\n');

    const llmResponse = await financialPrompt({
      query: input.query,
      context: context,
    });
    return llmResponse;
  }
);

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  try {
    const result = await generateRagAnswerFlow(input);
    return result;
  } catch (error: any) {
    console.error('Error in generateRagAnswer flow:', error);
    throw new Error(`Failed to get answer from AI: ${error.message}`);
  }
}
