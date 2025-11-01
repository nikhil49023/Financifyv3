
'use server';
/**
 * @fileOverview This flow is deprecated. The new flow is generate-dpr-section.ts.
 * This file is kept to avoid breaking changes but is no longer used by the application.
 */
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '@/lib/firebase';
import type { GenerateDprInput, GenerateDprOutput } from '@/ai/schemas/dpr';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash-lite-001' });

export async function generateDpr(
  input: GenerateDprInput
): Promise<GenerateDprOutput> {
  throw new Error(
    'This DPR generation flow is deprecated. Use the section-by-section generation flow instead.'
  );
}
