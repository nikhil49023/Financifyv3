import { z } from 'zod';
import { ExtractedTransactionSchema } from './transactions';

export const GenerateRagAnswerInputSchema = z.object({
  query: z.string().describe("The user's financial question."),
  documents: z
    .array(z.string())
    .optional()
    .describe('An optional array of document IDs to provide as context for the RAG model.'),
  transactions: z
    .array(ExtractedTransactionSchema)
    .optional()
    .describe('An optional array of user transactions to provide as context.'),
});
export type GenerateRagAnswerInput = z.infer<typeof GenerateRagAnswerInputSchema>;

export const GenerateRagAnswerOutputSchema = z.object({
  answer: z
    .string()
    .describe("A simple, crisp, and concise response to the user's query."),
});
export type GenerateRagAnswerOutput = z.infer<typeof GenerateRagAnswerOutputSchema>;
