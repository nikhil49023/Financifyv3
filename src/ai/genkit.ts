/**
 * @fileoverview This file initializes the Genkit AI platform with the necessary plugins.
 * It configures Genkit to use Google's Gemini models for generative AI tasks
 * and Firebase for backend services like tracing.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {firebase} from '@genkit-ai/firebase';
import {genkitEval} from 'genkit-eval';
import {googleCloud} from '@genkit-ai/google-cloud';

// Initialize Genkit and export the 'ai' object.
// The plugins are passed directly to the constructor, which is the modern
// way to configure Genkit. This makes the models and tools provided by these
// plugins available throughout the application.
export const ai = genkit({
  plugins: [
    // The Google AI plugin provides access to Gemini models.
    googleAI(),
    // The Firebase plugin integrates Genkit with Firebase for features
    // like flow tracing and monitoring.
    firebase(),
    // The Eval plugin provides tools for evaluating the quality of AI responses.
    genkitEval(),
    googleCloud(),
  ],
  // Log all traces to the console for debugging purposes.
  // In a production environment, you might want to set this to 'warn' or 'error'.
  logLevel: 'debug',
  // Enable native Javascript tracing.
  enableTracing: true,
});
