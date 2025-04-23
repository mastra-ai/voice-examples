# Voice Examples

This repository contains a collection of example applications demonstrating various voice-based AI capabilities using Mastra and related technologies.

## Examples Overview

### Speech-to-Text

- **Voice Memo App**: A Next.js application that records audio notes and automatically generates summaries.
  - Records audio directly in the browser
  - Transcribes spoken content using OpenAI's speech recognition
  - Generates concise summaries of recorded notes

### Text-to-Speech

- **Interactive Story**: An AI-powered storytelling application that creates branching narratives with voice narration.
  - Creates dynamic stories based on user input (genre, protagonist, setting)
  - Offers choices that affect the narrative direction
  - Provides high-quality voice narration of the generated stories

- **Turn-Taking Debate**: A demonstration of AI agents engaging in a structured debate with distinct voices.
  - Features two AI personalities (Optimist and Skeptic) discussing topics
  - Showcases turn-taking conversation patterns
  - Provides audio playback of the entire debate

### Speech-to-Speech

- **Call Analysis**: A complete voice conversation system with analytics integration.
  - Real-time speech-to-speech conversation with a Mastra agent
  - Conversation recording and audio file management
  - Integration with Roark Analytics for call analysis
  - Event hooks for conversation lifecycle management
  - Cloudinary integration for audio file storage

## Getting Started

Each example contains its own README with specific setup instructions. Generally, you'll need:

1. Node.js and a package manager (npm, yarn, or pnpm)
2. An OpenAI API key (set in environment variables)
3. Additional API keys for specific examples (Cloudinary, Roark, etc.)

## Common Setup Steps

1. Navigate to the example directory
2. Install dependencies: `pnpm install` (or npm/yarn)
3. Create a `.env` file with required API keys
4. Start the Mastra development server: `pnpm mastra:dev`
5. Start the application: `pnpm dev`

## Technologies Used

- [Mastra](https://mastra.ai) - Voice AI framework
- [Next.js](https://nextjs.org) - React framework for web applications
- [OpenAI](https://openai.com) - AI models for text generation and voice synthesis
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## License

See the LICENSE file for details.
