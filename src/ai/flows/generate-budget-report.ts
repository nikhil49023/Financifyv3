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
const model = getGenerativeModel(ai, {model: 'gemini-pro'});

export async function generateBudgetReport(
  input: GenerateBudgetReportInput
): Promise<GenerateBudgetReportOutput> {
  const transactionsList = input.transactions
    .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
    .join('\n');

  const prompt = `You are a financial analyst. Based on the following transactions, provide a spending analysis and an expense breakdown.
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
    return parsed as GenerateBudgetReportOutput;
  } catch (e) {
    console.error('Failed to parse JSON from model response:', response.text());
    throw new Error('Could not generate budget report. The AI returned an invalid format.');
  }
}
