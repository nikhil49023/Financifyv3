import {z} from 'zod';

// Input for the consolidated DPR generation flow
export const GenerateDprInputSchema = z.object({
  idea: z.string().describe("The user's initial business idea."),
  promoterName: z.string().describe("The name of the entrepreneur."),
});
export type GenerateDprInput = z.infer<typeof GenerateDprInputSchema>;

// This schema is now internal to the flow and doesn't need to be exported.
const FinancialProjectionsSchema = z.object({
  summaryText: z
    .string()
    .describe(
      'A brief summary of the financial outlook in markdown format. Prepend "*(Powered by FIn-Box AI)*".'
    ),
  projectCost: z
    .string()
    .describe(
      'Breakdown of total project costs in markdown format. Prepend "*(Powered by FIn-Box AI)*".'
    ),
  meansOfFinance: z
    .string()
    .describe(
      'How the project will be financed (equity, debt) in markdown format. Prepend "*(Powered by FIn-Box AI)*".'
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
      'Analysis of profitability in markdown format. Prepend "*(Powered by FIn-Box AI)*".'
    ),
  cashFlowStatement: z
    .string()
    .describe(
      'Projected cash flow statement in markdown format. Prepend "*(Powered by FIn-Box AI)*".'
    ),
  loanRepaymentSchedule: z
    .string()
    .describe(
      'Loan repayment schedule in markdown format. Prepend "*(Powered by FIn-Box AI)*".'
    ),
  breakEvenAnalysis: z
    .string()
    .describe(
      'Break-even point analysis in markdown format. Prepend "*(Powered by FIn-Box AI)*".'
    ),
});

export const GenerateDprOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  projectIntroduction: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  promoterDetails: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  businessModel: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  marketAnalysis: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  locationAndSite: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  technicalFeasibility: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  implementationSchedule: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  financialProjections: FinancialProjectionsSchema,
  swotAnalysis: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  regulatoryCompliance: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  riskAssessment: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
  annexures: z
    .string()
    .describe('Must be a markdown string. Prepend "*(Powered by FIn-Box AI)*".'),
});
export type GenerateDprOutput = z.infer<typeof GenerateDprOutputSchema>;
