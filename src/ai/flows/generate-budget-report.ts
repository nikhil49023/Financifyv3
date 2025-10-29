
'use server';

/**
 * @fileOverview A function for generating a budget report using Gemini.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateBudgetReportInputSchema,
  GenerateBudgetReportOutputSchema,
  type GenerateBudgetReportInput,
  type GenerateBudgetReportOutput,
} from '@/ai/schemas/budget-report';

const budgetReportPrompt = ai.definePrompt(
    {
        name: 'budgetReporter',
        input: { schema: GenerateBudgetReportInputSchema },
        output: { schema: GenerateBudgetReportOutputSchema },
        prompt: `You are a financial analyst. Based on the following transactions, provide a spending analysis and an expense breakdown.
Your response MUST be a valid JSON object.

Group similar expenses into logical categories (e.g., "Food", "Transport", "Shopping").

Example Output for schema:
{
  "summary": "*(Powered by FIn-Box AI)* Your spending is highest in Food...",
  "expenseBreakdown": [
    { "name": "Food", "value": 5000 },
    { "name": "Transport", "value": 2500 }
  ]
}

Here is the list of transactions to analyze:
{{#each transactions}}
- {{description}}: {{amount}} ({{type}}) on {{date}}
{{/each}}
`
    }
);


export async function generateBudgetReport(
  input: GenerateBudgetReportInput
): Promise<GenerateBudgetReportOutput> {
  const { output } = await budgetReportPrompt(input);
   if (!output) {
    throw new Error('Failed to generate budget report: No output from AI.');
  }
  return output;
}
