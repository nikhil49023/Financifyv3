import {generateDprFromElaboration} from '@/ai/flows/generate-dpr-from-elaboration';
import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Add validation here if needed for the elaborated profile
    const result = await generateDprFromElaboration(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in full DPR generation API:', error);
    return NextResponse.json(
      {message: `Failed to generate full DPR: ${error.message}`},
      {status: 500}
    );
  }
}
