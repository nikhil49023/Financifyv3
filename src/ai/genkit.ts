'use server';

/**
 * @fileoverview This file initializes the Genkit AI plugin for the application.
 * It configures and exports a global `ai` object that is used by all AI flows.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {firebase} from '@genkit-ai/firebase';
import {genkitEval} from '@genkit-ai/eval';

// Initialize Genkit and export the 'ai' object.
// The plugins are passed directly to the constructor, which is the modern
// approach and replaces the deprecated `configureGenkit` function.
export const ai = genkit({
  plugins: [
    firebase(),
    googleAI(),
    genkitEval({
      judge: 'googleai/gemini-1.5-pro-latest',
      metrics: ['reasoning'],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
