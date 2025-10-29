
'use server';

/**
 * @fileOverview A function for generating a budget report.
 * This implementation has been refactored to use a non-Genkit AI service.
 */

import catalystService from '@/services/catalyst';
import type {
  GenerateBudgetReportInput,
  GenerateBudgetReportOutput,
} from '@/ai/schemas/budget-report';

const PROMPT_TEMPLATE = `You are a financial analyst. Based on the following transactions, provide a spending analysis and an expense breakdown.
Your response MUST be ONLY a valid JSON object that conforms to the output schema. Do NOT include any other text, markdown, or explanations.

The JSON schema is:
{
  "summary": "An AI-generated summary and analysis of the spending habits...",
  "expenseBreakdown": [
    { "name": "CategoryName", "value": 1234.56 },
    ...
  ]
}

Group similar expenses into logical categories (e.g., "Food", "Transport", "Shopping").

Here is the list of transactions to analyze:
{{TRANSACTIONS}}
`;

function formatTransactionsForPrompt(
  transactions: GenerateBudgetReportInput['transactions']
): string {
  return transactions
    .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
    .join('\n');
}

export async function generateBudgetReport(
  input: GenerateBudgetReportInput
): Promise<GenerateBudgetReportOutput> {
  const transactionsString = formatTransactionsForPrompt(input.transactions);
  const prompt = PROMPT_TEMPLATE.replace(
    '{{TRANSACTIONS}}',
    transactionsString
  );

  try {
    const rawResponse = await catalystService.getRagAnswer({ query: prompt });

    // The AI might return the JSON wrapped in markdown, so we need to clean it.
    const jsonString = rawResponse.replace(/```json\n|```/g, '').trim();
    const parsedOutput = JSON.parse(jsonString);

    return parsedOutput;
  } catch (error: any) {
    console.error('Failed to generate or parse budget report:', error);
    throw new Error(
      `Failed to generate budget report. The AI response was not valid JSON. Response: ${error.message}`
    );
  }
}
