'use server';

/**
 * @fileoverview This file initializes the Genkit AI plugin for the application.
 * It configures and exports a global `ai` object that is used by all AI flows.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { configureGenkit } from '@genkit-ai/next';

// Configure Genkit with the Google AI plugin.
// This makes the Gemini models available for use in the application.
// The plugin will automatically use the GEMINI_API_KEY from your .env file.
configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Export the configured ai object for use in other flows.
export { genkit as ai };
