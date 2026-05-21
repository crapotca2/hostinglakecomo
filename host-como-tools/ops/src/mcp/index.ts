import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { listProperties, ListPropertiesInput } from "../core/tools/list-properties.js";

const server = new Server(
  { name: "host-como-ops", version: "0.0.1" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_properties",
      description: "List all properties registered on the Beds24 account for Host Como.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "list_properties") {
    ListPropertiesInput.parse(args ?? {});
    const out = await listProperties();
    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
    };
  }
  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
