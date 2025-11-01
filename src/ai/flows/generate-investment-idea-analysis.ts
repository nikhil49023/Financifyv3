
'use server';

/**
 * @fileOverview A flow for generating a detailed analysis of a business idea using Firebase AI
 * and fetching government schemes from the RAG backend.
 */
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '@/lib/firebase';
import { generateRagAnswer } from '@/ai/flows/generate-rag-answer';
import type {
  GenerateInvestmentIdeaAnalysisInput,
  GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/investment-idea-analysis';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash-lite-001' });

export async function generateInvestmentIdeaAnalysis(
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<GenerateInvestmentIdeaAnalysisOutput> {
  // Step 1: Generate the main analysis from the primary model, excluding schemes.
  const mainAnalysisPrompt = `You are a specialized financial mentor for early-stage entrepreneurs in India.
Your task is to provide a detailed, structured, and organized analysis of the following business idea:
"${input.idea}"

CRITICAL: You MUST output ONLY a valid JSON object. Do NOT include the 'relevantSchemes' key.
The schema is:
{
  "title": "The name of the business idea.",
  "summary": "A brief summary of the business concept. Prepend \\"*(Powered by Financify AI)*\\".",
  "investmentStrategy": "Detail the required initial investment. Prepend \\"*(Powered by Financify AI)*\\".",
  "targetAudience": "Describe the ideal customer for this business. Prepend \\"*(Powered by Financify AI)*\\".",
  "roi": "Provide a realistic projection of potential revenue and profit. Prepend \\"*(Powered by Financify AI)*\\".",
  "futureProofing": "Discuss the long-term viability of the business. Prepend \\"*(Powered by Financify AI)*\\"."
}
`;

  const { response: mainResponse } = await model.generateContent(mainAnalysisPrompt);
  let partialAnalysis: Omit<GenerateInvestmentIdeaAnalysisOutput, 'relevantSchemes'>;
  try {
    const text = mainResponse.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    partialAnalysis = JSON.parse(cleanedText);
  } catch (e) {
    console.error('Failed to parse JSON from main model response:', mainResponse.text());
    throw new Error('Could not generate the core idea analysis. The AI returned an invalid format.');
  }

  // Step 2: Fetch relevant government schemes from the RAG service.
  let schemesText = 'Could not fetch relevant government schemes at this time.';
  try {
    const ragQuery = `List 2-3 relevant Indian government schemes for a business idea about "${input.idea}". For each scheme, briefly explain what it offers and who is eligible.`;
    const ragResult = await generateRagAnswer({ query: ragQuery });
    if (ragResult.answer) {
      schemesText = `*(Powered by Financify AI)* ${ragResult.answer}`;
    }
  } catch (e) {
    console.error('Failed to fetch schemes from RAG service:', e);
    // Use a fallback text if RAG fails, so the whole process doesn't stop.
  }

  // Step 3: Combine the results into the final output object.
  const fullAnalysis: GenerateInvestmentIdeaAnalysisOutput = {
    ...partialAnalysis,
    relevantSchemes: schemesText,
  };

  return fullAnalysis;
}
