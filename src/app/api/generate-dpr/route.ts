import {generateDpr} from '@/ai/flows/generate-dpr';
import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.idea || !body.promoterName) {
      return NextResponse.json(
        {message: 'Idea and promoter name are required'},
        {status: 400}
      );
    }
    const result = await generateDpr(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in full DPR generation API:', error);
    return NextResponse.json(
      {message: `Failed to generate full DPR: ${error.message}`},
      {status: 500}
    );
  }
}
