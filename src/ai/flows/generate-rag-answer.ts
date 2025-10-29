'use server';

/**
 * @fileOverview A flow for answering questions using Genkit and Gemini, with transaction history as context.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateRagAnswerInputSchema,
  GenerateRagAnswerOutputSchema,
  type GenerateRagAnswerInput,
  type GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';

const ragPrompt = ai.definePrompt({
  name: 'ragAdvisor',
  input: {schema: GenerateRagAnswerInputSchema},
  output: {schema: GenerateRagAnswerOutputSchema},
  prompt: `You are FIn-Box, a helpful financial advisor AI for Indian entrepreneurs. Your answers should be simple, crisp, and concise. Analyze the user's transaction history and their query to provide a relevant and personalized response.

{{#if transactions}}
**User's Recent Transactions (for context):**
{{#each transactions}}
- {{this.date}}: {{this.description}} - {{this.amount}} ({{this.type}})
{{/each}}
{{else}}
**User has no recent transactions.**
{{/if}}

---

**User's Query:**
"{{query}}"
`,
});

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  const {output} = await ragPrompt(input);
  if (!output) {
    throw new Error('Failed to get an answer from the AI.');
  }
  return output;
}
