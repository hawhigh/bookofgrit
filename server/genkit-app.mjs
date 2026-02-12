
import { genkit, z } from 'genkit';
import { googleAI, gemini20Flash } from '@genkit-ai/google-genai';

const ai = genkit({
    plugins: [googleAI()],
    model: gemini20Flash,
});

export const drillFlow = ai.defineFlow(
    {
        name: 'drillFlow',
        inputSchema: z.object({
            difficulty: z.enum(['RECRUIT', 'OPERATOR', 'ELITE', 'COMMANDER']).default('OPERATOR'),
            focus: z.string().optional()
        }),
        outputSchema: z.object({
            title: z.string(),
            type: z.string(),
            objective: z.string(),
            intel: z.string(),
            protocols: z.array(z.string()),
            warning: z.string()
        }),
    },
    async (input) => {
        const { text } = await ai.generate({
            prompt: `
        You are the 'Grit Intelligence Agency'. Generate a high-stakes, hardcore tactical drill.
        DIFFICULTY: ${input.difficulty}
        FOCUS: ${input.focus || 'GENERIC_FORTITUDE'}
        
        Style: Brutalist, Stoic, Military-grade instructions.
        Format: JSON.
      `,
            config: { temperature: 0.9 }
        });

        // In a real scenario, text would be parsed. Here we return structured output directly if using outputSchema.
        return JSON.parse(text);
    }
);
