'use server';

/**
 * @fileOverview A function for generating a dashboard summary from transaction data using Genkit and Gemini.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  GenerateDashboardSummaryInputSchema,
  GenerateDashboardSummaryOutputSchema,
} from '../schemas/dashboard-summary';

type GenerateDashboardSummaryInput = z.infer<
  typeof GenerateDashboardSummaryInputSchema
>;
type GenerateDashboardSummaryOutput = z.infer<
  typeof GenerateDashboardSummaryOutputSchema
>;

// Define the prompt for generating only the suggestion
const suggestionPrompt = ai.definePrompt({
  name: 'suggestionGenerator',
  input: {
    schema: z.object({
      summary: z.object({
        totalIncome: z.number(),
        totalExpenses: z.number(),
        savingsRate: z.number(),
      }),
      transactionSample: z.string(),
    }),
  },
  output: {
    schema: z.object({
      suggestion: z.string(),
    }),
  },
  prompt: `You are "FIn-Box," a financial analyst. Based on the following financial summary and transaction list for an entrepreneur, provide one short, actionable "Fin Bite" (a financial tip). Your response MUST be a valid JSON object with a "suggestion" key.

Example Output:
\`\`\`json
{
  "suggestion": "Your spending on subscriptions is high. Consider reviewing them."
}
\`\`\`

Financial Summary:
- Total Income: {{summary.totalIncome}}
- Total Expenses: {{summary.totalExpenses}}
- Savings Rate: {{summary.savingsRate}}%

Transaction List (sample):
{{transactionSample}}
`,
});

// Helper to safely parse currency strings
function parseCurrency(amount: string | number): number {
  if (typeof amount === 'number') {
    return amount;
  }
  if (typeof amount === 'string') {
    // Remove currency symbols, commas, and keep only numbers and decimal points
    const sanitizedAmount = amount.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(sanitizedAmount);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function generateDashboardSummary(
  input: GenerateDashboardSummaryInput
): Promise<GenerateDashboardSummaryOutput> {
  const {transactions} = input;

  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      savingsRate: 0,
      suggestion:
        'Start by adding some transactions to see your financial summary.',
    };
  }

  // 1. Calculate totals server-side
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
    const amount = parseCurrency(t.amount);
    if (t.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }
  });

  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0;

  const summary = {totalIncome, totalExpenses, savingsRate};

  // 2. Generate a sample of transactions for the AI prompt
  const transactionSample = transactions
    .slice(0, 15) // Use a sample of up to 15 transactions
    .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
    .join('\n');

  // 3. Call the AI to get just the suggestion
  let suggestion =
    'Review your spending to find potential savings opportunities.';
  try {
    const {output} = await suggestionPrompt({summary, transactionSample});
    if (output?.suggestion) {
      suggestion = output.suggestion;
    }
  } catch (e: any) {
    console.error('Failed to generate dashboard suggestion from AI:', e.message);
    // Fallback to the default suggestion if AI fails
  }

  // 4. Return the combined result
  return {
    ...summary,
    suggestion,
  };
}
