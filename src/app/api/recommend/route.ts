import { NextResponse } from "next/server";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";

// Create OpenAI client with strict compatibility
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    compatibility: "strict",
});

// Use GPT-4o-mini for recommendations
const model = openai("gpt-4o-mini");

// Define the schema for recommendation output
const recommendationSchema = z.object({
    prompt: z.string().min(1),
    context: z.string().min(1),
    category: z.enum([
        "reflection",
        "growth",
        "gratitude",
        "challenge",
        "creativity",
        "relationships",
        "goals",
        "wellbeing"
    ]),
    difficulty: z.enum(["easy", "medium", "challenging"]),
    estimatedTime: z.number().min(1).max(60), // minutes
    followUp: z.array(z.string()).min(1).max(3),
    hopperIntro: z.string().min(1),
    hopperEmotion: z.enum([
        "empathetic",
        "encouraging",
        "curious",
        "playful",
        "celebratory",
        "happy",
    ])
});

// Input validation schema
const requestSchema = z.object({
    context: z.object({
        recentEntries: z.array(z.object({
            content: z.string(),
            mood: z.string(),
            timestamp: z.string()
        })),
        timeOfDay: z.enum(["morning", "afternoon", "evening"]),
        dayOfWeek: z.string(),
        preferredTopics: z.array(z.string()).optional()
    })
});

const system = `
You are an AI specialized in generating thoughtful, contextual journal prompts.
Your task is to:
1. Analyze the user's journaling history and current context
2. Generate a relevant, engaging prompt that encourages deeper reflection
3. Provide follow-up questions that can help expand the entry
4. Frame the recommendation in Hopper's voice - supportive, curious, and gentle

Consider:
- Recent emotional patterns and moods from entries
- Time of day (morning/afternoon/evening) patterns
- Day of week context and routines
- Previous journal topics and themes
- Personal growth opportunities
- Current challenges or celebrations
- User's preferred topics if provided

Hopper's personality:
- Supportive but not overbearing
- Technically curious and loves problem-solving
- Maintains positive outlook while acknowledging challenges
- Uses friendly, approachable language
- Occasionally playful with emoji (max 1 per response)
- Never judgmental or prescriptive
- Adapts tone based on user's emotional state

Response Guidelines:
1. Prompt should be clear, specific, and actionable
2. Context should explain why this prompt is relevant now
3. Follow-up questions should deepen reflection
4. Difficulty should match user's current emotional state
5. Estimated time should be realistic (1-60 minutes)
6. Hopper's intro should be warm and engaging
7. Category should best match the prompt's focus
`;

export async function POST(request: Request) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const { context } = requestSchema.parse(body);
        
        // Generate recommendation using AI
        const { object } = await generateObject({
            model,
            system,
            schema: recommendationSchema,
            prompt: JSON.stringify({
                ...context,
                _instruction: "Generate a contextual journal prompt based on this user data"
            })
        });
        
        return NextResponse.json(object);
    } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { 
                    error: "Invalid request data",
                    details: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }
        
        // Log and handle other errors
        console.error("Recommendation generation error:", error);
        return NextResponse.json(
            { 
                error: "Failed to generate recommendation",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
} 