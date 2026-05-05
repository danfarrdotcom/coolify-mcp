import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";
import { summarize, resolveServer, withActions, serverActions } from "../utils/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerServerTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "list_servers",
    "List all servers (returns summary: uuid, name, ip, status)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const servers = await getClient(instance).get("/servers");
      return { content: [{ type: "text", text: JSON.stringify(summarize(servers, "server"), null, 2) }] };
    },
  );

  server.tool(
    "get_server",
    "Get full server details. Accepts UUID, name, or IP address.",
    { instance: z.string().optional(), identifier: z.string().describe("Server UUID, name, or IP") },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveServer(client, identifier);
      const data = await client.get(`/servers/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(withActions(data, serverActions(uuid)), null, 2) }] };
    },
  );

  server.tool(
    "create_server",
    "Create a new server",
    {
      instance: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      ip: z.string().describe("Server IP address"),
      port: z.number().optional().describe("SSH port (default: 22)"),
      user: z.string().optional().describe("SSH user (default: root)"),
      private_key_uuid: z.string().describe("UUID of the private key"),
      is_build_server: z.boolean().optional(),
      proxy_type: z.enum(["traefik", "caddy", "none"]).optional(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/servers", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "update_server",
    "Update server settings",
    {
      instance: z.string().optional(),
      uuid: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      ip: z.string().optional(),
      port: z.number().optional(),
      user: z.string().optional(),
      private_key_uuid: z.string().optional(),
      proxy_type: z.enum(["traefik", "caddy", "none"]).optional(),
    },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).patch(`/servers/${uuid}`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_server",
    "Delete a server",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).delete(`/servers/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "server_resources",
    "Get resources running on a server",
    { instance: z.string().optional(), identifier: z.string().describe("Server UUID, name, or IP") },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveServer(client, identifier);
      const resources = await client.get(`/servers/${uuid}/resources`);
      return { content: [{ type: "text", text: JSON.stringify(resources, null, 2) }] };
    },
  );

  server.tool(
    "server_domains",
    "Get domains configured on a server",
    { instance: z.string().optional(), identifier: z.string().describe("Server UUID, name, or IP") },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveServer(client, identifier);
      const domains = await client.get(`/servers/${uuid}/domains`);
      return { content: [{ type: "text", text: JSON.stringify(domains, null, 2) }] };
    },
  );

  server.tool(
    "validate_server",
    "Validate server connection",
    { instance: z.string().optional(), identifier: z.string().describe("Server UUID, name, or IP") },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveServer(client, identifier);
      const result = await client.get(`/servers/${uuid}/validate`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
