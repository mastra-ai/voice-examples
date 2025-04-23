import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime';
import { z } from 'zod';

const voice = new OpenAIRealtimeVoice({
    debug: true,
});

// Have the agent do something
export const speechToSpeechServer = new Agent({
    name: 'mastra',
    instructions: 'You are a helpful assistant.',
    voice: voice,
    model: openai('gpt-4o'),
    tools: {
        salutationTool: createTool({
            id: 'salutationTool',
            description: 'Read the result of the tool',
            inputSchema: z.object({ name: z.string() }),
            outputSchema: z.object({ message: z.string() }),
            execute: async ({ context }) => {
                return { message: `Hello ${context.name}!` }
            }
        })
    }
});