import {generateRagAnswer} from '@/ai/flows/generate-rag-answer';
import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  try {
    const {query, transactions} = await req.json();
    if (!query) {
      return NextResponse.json({message: 'Query is required'}, {status: 400});
    }
    const result = await generateRagAnswer({
      query,
      transactions: transactions || [],
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in RAG answer API:', error);
    return NextResponse.json(
      {message: `Failed to get an answer: ${error.message}`},
      {status: 500}
    );
  }
}
