// import { z } from "zod";

// Define the schema for recommendation output
// const recommendationSchema = z.object({
//     prompt: z.string().min(1),
//     context: z.string().min(1),
//     category: z.enum([
//         "reflection",
//         "growth",
//         "gratitude",
//         "challenge",
//         "creativity",
//         "relationships",
//         "goals",
//         "wellbeing"
//     ]),
//     difficulty: z.enum(["easy", "medium", "challenging"]),
//     estimatedTime: z.number().min(1).max(60), // minutes
//     followUp: z.array(z.string()).min(1).max(3),
//     hopperIntro: z.string().min(1)
// });

// export type JournalRecommendation = z.infer<typeof recommendationSchema>;

export interface JournalRecommendation {
    prompt: string;
    context: string;
    category: "reflection" | "growth" | "gratitude" | "challenge" | "creativity" | "relationships" | "goals" | "wellbeing";
    difficulty: "easy" | "medium" | "challenging";
    estimatedTime: number;
    followUp: string[];
    hopperIntro: string;
}
