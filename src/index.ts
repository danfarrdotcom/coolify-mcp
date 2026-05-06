#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config/index.js";
import { CoolifyClient } from "./client/index.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

const config = loadConfig();
const clients = new Map<string, CoolifyClient>();

for (const instance of config.instances) {
  clients.set(instance.name, new CoolifyClient(instance));
}

function getClient(name?: string): CoolifyClient {
  const key = name || config.defaultInstance;
  const client = clients.get(key);
  if (!client) {
    throw new Error(`Unknown instance "${key}". Available: ${[...clients.keys()].join(", ")}`);
  }
  return client;
}

const server = new McpServer({
  name: "@drfarr/coolify-mcp",
  version: "0.1.1",
});

registerTools(server, getClient, config);
registerResources(server, getClient, config);
registerPrompts(server);

const transport = new StdioServerTransport();
await server.connect(transport);
