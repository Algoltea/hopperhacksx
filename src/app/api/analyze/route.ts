import { analyzeMood } from "@/lib/ai/ai";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  text: z.string().min(1, "Please enter some text to analyze"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = requestSchema.parse(body);

    const analysis = await analyzeMood(text);
    
    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Mood analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze mood" },
      { status: 500 }
    );
  }
} 