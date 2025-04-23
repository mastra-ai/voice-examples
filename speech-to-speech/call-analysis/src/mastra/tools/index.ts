import { MCPConfiguration } from "@mastra/mcp";

const mcp = new MCPConfiguration({
    servers: {
        registry: {
            command: "npx",
            args: ["-y", "@mastra/mcp-registry-registry@alpha"],
        }
    }
})

export const mcpTools = await mcp.getTools()