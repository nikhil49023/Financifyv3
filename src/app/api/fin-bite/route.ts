import {generateFinBite} from '@/ai/flows/generate-fin-bite';
import {NextResponse} from 'next/server';

export async function GET() {
  try {
    const result = await generateFinBite();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating Fin Bite:', error);
    return NextResponse.json(
      {message: `Failed to generate the latest update: ${error.message}`},
      {status: 500}
    );
  }
}
