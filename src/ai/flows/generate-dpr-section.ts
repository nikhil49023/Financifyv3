
'use server';
/**
 * @fileOverview A flow for generating a single section of a Detailed Project Report (DPR).
 * It can generate content from scratch or refine existing content based on a custom prompt.
 */
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '@/lib/firebase';
import type { GenerateDprSectionInput, GenerateDprSectionOutput } from '@/ai/schemas/dpr';

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: 'gemini-1.5-pro-latest' });

export async function generateDprSection(
  input: GenerateDprSectionInput
): Promise<GenerateDprSectionOutput> {
  const { idea, promoterName, section, basePrompt, existingContent, refinementPrompt } = input;

  const businessProfile = `
---
**Business Profile**
Title: ${idea.title}
Summary: ${idea.summary}
InvestmentStrategy: ${idea.investmentStrategy}
TargetAudience: ${idea.targetAudience}
ROI Projection: ${idea.roi}
Future-Proofing: ${idea.futureProofing}
Relevant Schemes: ${idea.relevantSchemes}
---`;

  let finalPrompt: string;

  if (refinementPrompt && existingContent) {
    // Mode 2: Refine existing content
    finalPrompt = `You are an expert consultant editing a Detailed Project Report (DPR).
The user wants to refine the content for the "${section}" section.

**User's Instruction:** "${refinementPrompt}"

**Existing Content to Refine:**
---
${typeof existingContent === 'object' ? JSON.stringify(existingContent, null, 2) : existingContent}
---

Your task is to rewrite the "Existing Content" based on the "User's Instruction".
Maintain the original format (JSON for financial projections, HTML for others).
Output ONLY the refined, complete content for the section. Do not add any extra commentary.
Use basic HTML for formatting: <h3> for subheadings, <p> for paragraphs, <ul> and <li> for lists.

**Business Profile (for context):**
${businessProfile}
`;
  } else {
    // Mode 1: Generate from scratch
    finalPrompt = `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with a detailed business profile and the promoter's name.

Your current task is to generate the content for ONLY the following section: **${section}**.

**Section-Specific Instructions:**
${basePrompt}

**Critical Output Format:**
- For all sections EXCEPT 'financialProjections', you MUST output ONLY the generated text content as a raw string using basic HTML for formatting (<h3>, <p>, <ul>, <li>).
- For the 'financialProjections' section, you MUST output ONLY a valid JSON object matching the required schema for financial data.
- Do NOT include any other text, markdown formatting (like \`\`\`json), titles, or explanations in your response. Just the raw content.

**Business Profile (for context):**
${businessProfile}

**Promoter's Name:** "${promoterName}"

Now, generate the content for the "${section}" section.
`;
  }

  const { response } = await model.generateContent(finalPrompt);

  try {
    const text = response.text();
    // For the financial section, we expect JSON. For all others, we expect an HTML string.
    if (section === 'financialProjections') {
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      return { content: parsed };
    } else {
      return { content: text };
    }
  } catch (e) {
    console.error(`Failed to parse AI response for section "${section}":`, response.text());
    throw new Error(`The AI returned an invalid format for the ${section} section.`);
  }
}
