
import {z} from 'zod';
import { GenerateInvestmentIdeaAnalysisOutputSchema } from './investment-idea-analysis';

// Input for the original, full DPR generation flow (deprecated)
export const GenerateDprInputSchema = z.object({
  idea: z.union([z.string(), GenerateInvestmentIdeaAnalysisOutputSchema]).describe("The user's initial business idea or the full analysis object."),
  promoterName: z.string().describe("The name of the entrepreneur."),
});
export type GenerateDprInput = z.infer<typeof GenerateDprInputSchema>;

// Input for the new, section-by-section DPR generation flow
export const GenerateDprSectionInputSchema = z.object({
    idea: GenerateInvestmentIdeaAnalysisOutputSchema.describe("The full analysis object for the business idea."),
    promoterName: z.string().describe("The name of the entrepreneur."),
    section: z.string().describe("The specific section of the DPR to generate (e.g., 'executiveSummary')."),
    prompt: z.string().describe("The detailed prompt for the AI to generate the content for this specific section.")
});
export type GenerateDprSectionInput = z.infer<typeof GenerateDprSectionInputSchema>;

// Output for the new, section-by-section DPR generation flow
export const GenerateDprSectionOutputSchema = z.object({
    content: z.union([z.string(), z.any()])
        .describe("The generated content for the section. Can be a string for text-based sections or a JSON object for financial projections.")
});
export type GenerateDprSectionOutput = z.infer<typeof GenerateDprSectionOutputSchema>;


const FinancialProjectionsSchema = z.object({
  summaryText: z
    .string()
    .describe(
      'A brief summary of the financial outlook in markdown format.'
    ),
  projectCost: z
    .string()
    .describe(
      'Breakdown of total project costs in markdown format.'
    ),
  meansOfFinance: z
    .string()
    .describe(
      'How the project will be financed (equity, debt) in markdown format.'
    ),
  costBreakdown: z
    .array(z.object({name: z.string(), value: z.number()}))
    .describe(
      'A JSON array for a pie chart of cost breakdown. The values must be credible numbers.'
    ),
  yearlyProjections: z
    .array(z.object({year: z.string(), sales: z.number(), profit: z.number()}))
    .describe(
      'A JSON array for a bar chart of yearly sales and profit. The values must be credible numbers.'
    ),
  profitabilityAnalysis: z
    .string()
    .describe(
      'Analysis of profitability in markdown format.'
    ),
  cashFlowStatement: z
    .string()
    .describe(
      'Projected cash flow statement in markdown format.'
    ),
  loanRepaymentSchedule: z
    .string()
    .describe(
      'Loan repayment schedule in markdown format.'
    ),
  breakEvenAnalysis: z
    .string()
    .describe(
      'Break-even point analysis in markdown format.'
    ),
});

export const GenerateDprOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Must be a markdown string.'),
  projectIntroduction: z
    .string()
    .describe('Must be a markdown string.'),
  promoterDetails: z
    .string()
    .describe('Must be a markdown string.'),
  businessModel: z
    .string()
    .describe('Must be a markdown string.'),
  marketAnalysis: z
    .string()
    .describe('Must be a markdown string.'),
  locationAndSite: z
    .string()
    .describe('Must be a markdown string.'),
  technicalFeasibility: z
    .string()
    .describe('Must be a markdown string.'),
  implementationSchedule: z
    .string()
    .describe('Must be a markdown string.'),
  financialProjections: FinancialProjectionsSchema,
  swotAnalysis: z
    .string()
    .describe('Must be a markdown string.'),
  regulatoryCompliance: z
    .string()
    .describe('Must be a markdown string.'),
  riskAssessment: z
    .string()
    .describe('Must be a markdown string.'),
  annexures: z
    .string()
    .describe('Must be a markdown string.'),
});
export type GenerateDprOutput = z.infer<typeof GenerateDprOutputSchema>;
