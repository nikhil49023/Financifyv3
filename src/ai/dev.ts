
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-rag-answer';
// import '@/ai/flows/extract-transactions-from-document';
// import '@/ai/flows/generate-dashboard-summary';
import '@/ai/flows/generate-investment-idea-analysis';
import '@/ai/flows/generate-fin-bite';
// import '@/ai/flows/generate-budget-report';
import '@/ai/flows/generate-tts';
import '@/ai/flows/generate-dpr-elaboration';
import '@/ai/flows/generate-dpr-from-elaboration';
