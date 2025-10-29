/**
 * @fileOverview Zod schemas and TypeScript types for the dashboard summary.
 * These are now defined directly within the flow file and this file can be removed.
 * Kept for reference to avoid breaking imports immediately.
 */

import { z } from 'zod';
import { ExtractedTransactionSchema } from './transactions';

export const GenerateDashboardSummaryInputSchema = z.object({
  transactions: z
    .array(ExtractedTransactionSchema)
    .describe('An array of financial transactions.'),
});
export type GenerateDashboardSummaryInput = z.infer<typeof GenerateDashboardSummaryInputSchema>;


export const GenerateDashboardSummaryOutputSchema = z.object({
  totalIncome: z.number().describe('The total income for the period.'),
  totalExpenses: z.number().describe('The total expenses for the period.'),
  savingsRate: z
    .number()
    .describe('The savings rate as a percentage of income.'),
  suggestion: z
    .string()
    .describe(
      'A personalized financial suggestion based on the transaction data.'
    ),
});
export type GenerateDashboardSummaryOutput = z.infer<typeof GenerateDashboardSummaryOutputSchema>;
