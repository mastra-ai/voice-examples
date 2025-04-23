import { mastra } from "../../mastra";
import { playAudio, Recorder } from "@mastra/node-audio";
import * as p from "@clack/prompts";

// Helper function to format text with line wrapping
function formatText(text: string, maxWidth: number): string {
  const words = text.split(" ");
  let result = "";
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      result += (result ? "\n" : "") + currentLine;
      currentLine = word;
    }
  }

  if (currentLine) {
    result += (result ? "\n" : "") + currentLine;
  }

  return result;
}

// Initialize audio recorder
const recorder = new Recorder({
  outputPath: "./debate.mp3",
});

// Process one turn of the conversation
async function processTurn(
  agentName: "optimistAgent" | "skepticAgent",
  otherAgentName: string,
  topic: string,
  previousResponse: string = ""
) {
  const agent = mastra.getAgent(agentName);
  const spinner = p.spinner();
  spinner.start(`${agent.name} is thinking...`);

  let prompt;
  if (!previousResponse) {
    // First turn
    prompt = `Discuss this topic: ${topic}. Introduce your perspective on it.`;
  } else {
    // Responding to the other agent
    prompt = `The topic is: ${topic}. ${otherAgentName} just said: "${previousResponse}". Respond to their points.`;
  }

  // Generate text response
  const { text } = await agent.generate(prompt, {
    temperature: 0.9,
  });

  spinner.message(`${agent.name} is speaking...`);

  // Convert to speech and play
  const audioStream = await agent.voice.speak(text, {
    speed: 1.2,
    responseFormat: "wav", // Optional: specify a response format
  });

  if (audioStream) {
    audioStream.on("data", (chunk) => {
      recorder.write(chunk);
    });
  }

  spinner.stop(`${agent.name} said:`);

  // Format the text to wrap at 80 characters for better display
  const formattedText = formatText(text, 80);
  p.note(formattedText, agent.name);

  if (audioStream) {
    const speaker = playAudio(audioStream);

    await new Promise<void>((resolve) => {
      speaker.once("close", () => {
        resolve();
      });
    });
  }

  return text;
}

// Main function to run the debate
export async function runDebate(topic: string, turns: number = 3) {
  recorder.start();

  p.intro("AI Debate - Two Agents Discussing a Topic");
  p.log.info(`Starting a debate on: ${topic}`);
  p.log.info(
    `The debate will continue for ${turns} turns each. Press Ctrl+C to exit at any time.`
  );

  let optimistResponse = "";
  let skepticResponse = "";
  const responses = [];

  for (let turn = 1; turn <= turns; turn++) {
    p.log.step(`Turn ${turn}`);

    // Optimist's turn
    optimistResponse = await processTurn(
      "optimistAgent",
      "Skeptic",
      topic,
      skepticResponse
    );

    responses.push({
      agent: "Optimist",
      text: optimistResponse,
    });

    // Skeptic's turn
    skepticResponse = await processTurn(
      "skepticAgent",
      "Optimist",
      topic,
      optimistResponse
    );

    responses.push({
      agent: "Skeptic",
      text: skepticResponse,
    });
  }

  recorder.end();
  p.outro("Debate concluded! The full audio has been saved to debate.mp3");

  return responses;
}
