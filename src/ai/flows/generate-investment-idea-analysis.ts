
'use server';

/**
 * @fileOverview A flow for generating a detailed analysis of a business idea using Firebase AI.
 */
import {initializeApp, getApps} from 'firebase/app';
import {getAI, getGenerativeModel, GoogleAIBackend} from 'firebase/ai';
import {app} from '@/lib/firebase';
import type {
  GenerateInvestmentIdeaAnalysisInput,
  GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/investment-idea-analysis';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {model: 'gemini-2.0-flash-lite-001'});

export async function generateInvestmentIdeaAnalysis(
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<GenerateInvestmentIdeaAnalysisOutput> {
  const prompt = `You are a specialized financial mentor for early-stage entrepreneurs in India.
Your task is to provide a detailed, structured, and organized analysis of the following business idea:
"${input.idea}"

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the specified output schema. Do not include any other text, markdown, or explanations outside of the JSON structure.

The schema is:
{
  "title": "The name of the business idea.",
  "summary": "A brief summary of the business concept. Prepend \\"*(Powered by EmpowerMint AI)*\\".",
  "investmentStrategy": "Detail the required initial investment. Prepend \\"*(Powered by EmpowerMint AI)*\\".",
  "targetAudience": "Describe the ideal customer for this business. Prepend \\"*(Powered by EmpowerMint AI)*\\".",
  "roi": "Provide a realistic projection of potential revenue and profit. Prepend \\"*(Powered by EmpowerMint AI)*\\".",
  "futureProofing": "Discuss the long-term viability of the business. Prepend \\"*(Powered by EmpowerMint AI)*\\".",
  "relevantSchemes": "Identify 2-3 relevant Indian government schemes. Prepend \\"*(Powered by EmpowerMint AI)*\\"."
}
`;

  const {response} = await model.generateContent(prompt);

  try {
    const text = response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    return parsed as GenerateInvestmentIdeaAnalysisOutput;
  } catch (e) {
    console.error('Failed to parse JSON from model response:', response.text());
    throw new Error('Could not generate idea analysis. The AI returned an invalid format.');
  }
}
