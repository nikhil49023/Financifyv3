
'use server';

/**
 * @fileOverview A flow for generating a budget report from a list of transactions using Firebase AI.
 */
import {initializeApp, getApps} from 'firebase/app';
import {getAI, getGenerativeModel, GoogleAIBackend} from 'firebase/ai';
import {app} from '@/lib/firebase';
import type {
  GenerateBudgetReportInput,
  GenerateBudgetReportOutput,
} from '@/ai/schemas/budget-report';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {model: 'gemini-2.0-flash-lite-001'});

// Helper to safely parse currency strings
function parseCurrency(amount: string | number): number {
  if (typeof amount === 'number') {
    return amount;
  }
  if (typeof amount === 'string') {
    const sanitizedAmount = amount.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(sanitizedAmount);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function generateBudgetReport(
  input: GenerateBudgetReportInput
): Promise<GenerateBudgetReportOutput> {
  const transactionsList = input.transactions
    .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
    .join('\n');

  const prompt = `You are a financial analyst. Based on the following transactions, provide a spending analysis and a detailed expense breakdown.
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
${transactionsList}
`;

  const {response} = await model.generateContent(prompt);

  try {
    const text = response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    // Manually calculate overall breakdown
    let totalIncome = 0;
    let totalExpenses = 0;
    input.transactions.forEach(t => {
        const amount = parseCurrency(t.amount);
        if (t.type === 'income') {
            totalIncome += amount;
        } else {
            totalExpenses += amount;
        }
    });

    const savings = Math.max(0, totalIncome - totalExpenses);

    parsed.overallBreakdown = [
        { name: 'Total Income', value: totalIncome },
        { name: 'Total Expenses', value: totalExpenses },
        { name: 'Savings', value: savings }
    ].filter(item => item.value > 0); // Only show items with a value

    // Ensure expense breakdown is always an array
    if (!parsed.expenseBreakdown) {
      parsed.expenseBreakdown = [];
    }
    
    return parsed as GenerateBudgetReportOutput;
  } catch (e) {
    console.error('Failed to parse JSON from model response:', response.text());
    throw new Error('Could not generate budget report. The AI returned an invalid format.');
  }
}
