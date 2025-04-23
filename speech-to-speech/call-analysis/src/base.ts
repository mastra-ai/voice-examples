/**
 * This example demonstrates a complete voice conversation system with analytics.
 * Features:
 * - Real-time speech-to-speech conversation with a Mastra agent
 * - Conversation recording and audio file management
 * - Integration with Roark Analytics for call analysis
 * - Event hooks for conversation lifecycle management
 * - Cloudinary integration for audio file storage
 */

import { Roark } from '@roarkanalytics/sdk';
import chalk from 'chalk';

import { mastra } from './mastra';
import { createConversation, formatToolInvocations } from './utils';
import { uploadToCloudinary } from './upload';
import fs from 'fs';

const client = new Roark({
    bearerToken: process.env.ROARK_API_KEY
});

async function speechToSpeechServerExample() {
    const { start, stop } = createConversation({
        mastra,
        recordingPath: './speech-to-speech-server.mp3',
        providerOptions: {},
        initialMessage: 'Howdy partner',
        onConversationEnd: async (props) => {
            // File upload
            fs.writeFileSync(props.recordingPath, props.audioBuffer)
            const url = await uploadToCloudinary(props.recordingPath)

            // Send to Roark
            console.log('Send to Roark', url)
            const response = await client.callAnalysis.create({
                recordingUrl: url,
                startedAt: props.startedAt,
                callDirection: 'INBOUND',
                interfaceType: 'PHONE',
                participants: [
                    { role: 'AGENT', spokeFirst: props.agent.spokeFirst, name: props.agent.name, phoneNumber: props.agent.phoneNumber },
                    { role: 'CUSTOMER', name: 'Yujohn Nattrass', phoneNumber: '987654321' },
                ],
                properties: props.metadata,
                toolInvocations: formatToolInvocations(props.toolInvocations),
            });

            console.log('Call Recording Posted:', response.data);
        },
        onSpeaker: async (stream) => {
            // Additional custom speaker handling if needed
        },
        onSessionUpdated: async (session) => {
            // Additional custom session handling if needed
        },
        onResponseDone: async (item) => {
            // Additional custom response handling if needed
        },
        onResponseCreated: async (item) => {
            // Additional custom response handling if needed
        },
        onError: async (error) => {
            console.error(error)
        },
        onToolCallStart: async (toolCall) => {
            // Additional custom tool call start handling if needed
        },
        onToolCallResult: async (toolCall) => {
            // Additional custom tool call result handling if needed
        },
        onWriting: (ev) => {
            if (ev.role === 'assistant') {
                process.stdout.write(chalk.blue(ev.text));
            }
        },
    });

    await start();

    process.on('SIGINT', async (e) => {
        await stop();
    })
}


speechToSpeechServerExample().catch(console.error)
