import {generateDashboardSummary} from '@/ai/flows/generate-dashboard-summary';
import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  try {
    const {transactions} = await req.json();
    if (!transactions) {
      return NextResponse.json(
        {message: 'Transactions are required'},
        {status: 400}
      );
    }
    const result = await generateDashboardSummary({transactions});
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in dashboard summary API:', error);
    return NextResponse.json(
      {message: `Failed to generate dashboard summary: ${error.message}`},
      {status: 500}
    );
  }
}
