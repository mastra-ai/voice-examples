import { runDebate } from "./debate/turn-taking";
import * as p from "@clack/prompts";

async function main() {
  // Get the topic from the user
  const topic = await p.text({
    message: "Enter a topic for the agents to discuss:",
    placeholder: "Climate change",
    validate(value) {
      if (!value) return "Please enter a topic";
      return;
    },
  });

  // Exit if cancelled
  if (p.isCancel(topic)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // Get the number of turns
  const turnsInput = await p.text({
    message: "How many turns should each agent have?",
    placeholder: "3",
    initialValue: "3",
    validate(value) {
      const num = parseInt(value);
      if (isNaN(num) || num < 1) return "Please enter a positive number";
      return;
    },
  });

  // Exit if cancelled
  if (p.isCancel(turnsInput)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const turns = parseInt(turnsInput as string);

  // Run the debate
  await runDebate(topic as string, turns);
  
  process.exit(0);
}

main().catch((error) => {
  p.log.error("An error occurred:");
  console.error(error);
  process.exit(1);
});
