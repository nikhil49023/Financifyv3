
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
import { z } from 'zod';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash-lite-001' });

// Define a new schema for the intermediate analysis that includes the sector
const PartialAnalysisSchema = z.object({
  title: z.string().describe('The name of the business idea.'),
  summary: z.string().describe('A brief summary of the business concept. Prepend \\"*(Powered by Financify AI)*\\".'),
  investmentStrategy: z.string().describe('Detail the required initial investment. Prepend \\"*(Powered by Financify AI)*\\".'),
  targetAudience: z.string().describe('Describe the ideal customer for this business. Prepend \\"*(Powered by Financify AI)*\\".'),
  roi: z.string().describe('Provide a realistic projection of potential revenue and profit. Prepend \\"*(Powered by Financify AI)*\\".'),
  futureProofing: z.string().describe('Discuss the long-term viability of the business. Prepend \\"*(Powered by Financify AI)*\\".'),
  sector: z.string().describe('The specific industry or sector for this business idea (e.g., Agriculture, Retail, Manufacturing). Use simple, broad terms.'),
});
type PartialAnalysis = z.infer<typeof PartialAnalysisSchema>;


export async function generateInvestmentIdeaAnalysis(
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<GenerateInvestmentIdeaAnalysisOutput> {
  // Step 1: Generate the main analysis from the primary model, including the sector.
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
  "futureProofing": "Discuss the long-term viability of the business. Prepend \\"*(Powered by Financify AI)*\\".",
  "sector": "The specific industry or sector for this business idea. Use simple, broad terms like 'Agriculture', 'Manufacturing', 'Retail', or 'Services'. Avoid overly technical jargon like 'AgriTech'."
}
`;

  const { response: mainResponse } = await model.generateContent(mainAnalysisPrompt);
  let partialAnalysis: PartialAnalysis;
  try {
    const text = mainResponse.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    partialAnalysis = PartialAnalysisSchema.parse(JSON.parse(cleanedText));
  } catch (e) {
    console.error('Failed to parse JSON from main model response:', mainResponse.text(), e);
    throw new Error('Could not generate the core idea analysis. The AI returned an invalid format.');
  }

  // Step 2: Fetch relevant government schemes from the RAG service using the new, specific prompt.
  let schemesText = 'Could not fetch relevant government schemes at this time.';
  try {
    const ragQuery = `what are the incentives for ${partialAnalysis.title} in AP`;
    const ragResult = await generateRagAnswer({ query: ragQuery });
    if (ragResult.answer) {
      schemesText = `*(Powered by Financify AI)* ${ragResult.answer}`;
    }
  } catch (e) {
    console.error('Failed to fetch schemes from RAG service:', e);
    // Use a fallback text if RAG fails, so the whole process doesn't stop.
  }

  // Step 3: Combine the results into the final output object.
  const { sector, ...analysisData } = partialAnalysis;
  const fullAnalysis: GenerateInvestmentIdeaAnalysisOutput = {
    ...analysisData,
    relevantSchemes: schemesText,
  };

  return fullAnalysis;
}
