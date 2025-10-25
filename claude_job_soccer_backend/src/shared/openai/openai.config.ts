import OpenAI from "openai";
import config from "../../config";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: config.openai.api_key,
});

// OpenAI configuration constants
export const OPENAI_CONFIG = {
  model: "gpt-4o-mini", 
  temperature: 0.3, 
  maxTokens: 500,
} as const;



