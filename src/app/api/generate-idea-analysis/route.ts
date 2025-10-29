import {generateInvestmentIdeaAnalysis} from '@/ai/flows/generate-investment-idea-analysis';
import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  try {
    const {idea} = await req.json();
    if (!idea) {
      return NextResponse.json(
        {message: 'An idea is required for analysis.'},
        {status: 400}
      );
    }
    const result = await generateInvestmentIdeaAnalysis({idea});
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in investment idea analysis API:', error);
    return NextResponse.json(
      {
        message: `Failed to generate investment idea analysis: ${error.message}`,
      },
      {status: 500}
    );
  }
}
