import {extractTransactionsFromDocument} from '@/ai/flows/extract-transactions-from-document';
import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  try {
    const {documentDataUri} = await req.json();
    if (!documentDataUri) {
      return NextResponse.json(
        {message: 'documentDataUri is required'},
        {status: 400}
      );
    }
    const result = await extractTransactionsFromDocument({documentDataUri});
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in extract-transactions API:', error);
    return NextResponse.json(
      {message: `Failed to extract transactions: ${error.message}`},
      {status: 500}
    );
  }
}
