import {generateDprElaboration} from '@/ai/flows/generate-dpr-elaboration';
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
    const result = await generateDprElaboration(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in DPR elaboration API:', error);
    return NextResponse.json(
      {message: `Failed to generate DPR elaboration: ${error.message}`},
      {status: 500}
    );
  }
}
