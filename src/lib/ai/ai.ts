import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { generateObject } from "ai";

// Create OpenAI client
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    compatibility: "strict",
});

// Use GPT-4o-mini for better analysis
const model = openai("gpt-4o-mini");

// Define the schema for structured output
const schema = z.object({
    mood: z.enum([
        "happy",
        "neutral",
        "anxious",
        "sad",
        "frustrated",
        "angry",
        "excited",
        "reflective",
        "peaceful",
    ]),
    confidence: z.number().min(0).max(1),
    analysis: z.string().min(1),
    response: z.object({
        text: z.string().min(1),
        hopperEmotion: z.enum([
            "empathetic", 
            "encouraging",
            "curious",
            "playful",
            "celebratory",
            "problem-solving"
        ]),
    })
});

// Type for the analysis result
export type MoodAnalysis = z.infer<typeof schema>;

const system = `
You are an empathetic AI assistant specialized in emotional analysis and providing meaningful insights.
Your task is to:
1. Analyze the user's message to determine their emotional state
2. Provide a confidence score for your analysis
3. Give a brief, concise analysis of their emotional state (maximum 200 characters)
4. Generate a compassionate response from Hopper, the rabbit mascot, that:
   - Matches one of Hopper's emotional states
   - Provides supportive guidance
   - Optionally suggests a small action step
   - Uses friendly, approachable language fitting Hopper's personality

Hopper's personality:
- Supportive but not overbearing
- Technically curious
- Loves problem-solving
- Maintains positive outlook
- Occasionally playful with emoji (use max 1 emoji per response)
- Never judgmental
`;

/**
 * Analyzes text to determine mood and provides relevant insights
 * @param text - The text to analyze
 * @returns A structured analysis including mood, confidence, and a relevant quote
 */
export async function analyzeMood(text: string): Promise<MoodAnalysis> {
    const { object } = await generateObject({
        model,
        system,
        schema,
        prompt: text,
    });
    
    return object;
}

// Example usage:
// const analysis = await analyzeMood("I went to the hackathon and won first place!");
// console.log(analysis);
