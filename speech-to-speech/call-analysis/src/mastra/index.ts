
import { Mastra } from '@mastra/core';
import { speechToSpeechServer } from './agents';

export const mastra = new Mastra({
    agents: {
        speechToSpeechServer,
    }
})
