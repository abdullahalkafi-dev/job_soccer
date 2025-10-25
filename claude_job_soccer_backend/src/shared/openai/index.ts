/**
 * OpenAI Service Index
 * 
 * This module contains all OpenAI-related services for the application.
 * Currently includes:
 * - Profile Scoring: AI-powered scoring of candidate profiles
 * 
 * Future services can be added here as needed.
 */

export { generateProfileScore, batchGenerateProfileScores } from "./profileScoring.service";
export { openai, OPENAI_CONFIG } from "./openai.config";
