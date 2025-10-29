'use server';
/**
 * @fileOverview A flow for generating a full Detailed Project Report (DPR) using Firebase AI.
 */
import {initializeApp, getApps} from 'firebase/app';
import {getAI, getGenerativeModel, GoogleAIBackend} from 'firebase/ai';
import {app} from '@/lib/firebase';
import type {GenerateDprInput, GenerateDprOutput} from '@/ai/schemas/dpr';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {model: 'gemini-pro'});

export async function generateDpr(input: GenerateDprInput): Promise<GenerateDprOutput> {
  const prompt = `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with a basic business idea and the promoter's name.

Your task is to first internally elaborate on this idea to create a rich, detailed business profile. Then, use that elaborated profile to write the complete DPR.

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the final DPR output schema. Do not include any other text, markdown, or explanations.
Every string field in the output must start with "*(Powered by FIn-Box AI)*".

For the "financialProjections" section, you must generate the full financial object with credible, realistic data based on the business profile.
The 'costBreakdown' and 'yearlyProjections' fields must be valid JSON arrays for charts.
All other fields should be markdown strings, providing detailed and well-structured content for each section of the DPR.

**User's Business Idea:** "${input.idea}"
**Promoter's Name:** "${input.promoterName}"

Based on this, generate the complete JSON object for the DPR.
`;

  const {response} = await model.generateContent(prompt);
  try {
    const text = response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    return parsed as GenerateDprOutput;
  } catch (e) {
    console.error('Failed to parse JSON from model response:', response.text());
    throw new Error('Could not generate DPR. The AI returned an invalid format.');
  }
}
