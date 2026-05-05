import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerPrivateKeyTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "list_private_keys",
    "List all private keys",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const keys = await getClient(instance).get("/security/keys");
      return { content: [{ type: "text", text: JSON.stringify(keys, null, 2) }] };
    },
  );

  server.tool(
    "get_private_key",
    "Get private key details",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const key = await getClient(instance).get(`/security/keys/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(key, null, 2) }] };
    },
  );

  server.tool(
    "create_private_key",
    "Create a new private key",
    {
      instance: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      private_key: z.string().describe("The private key content"),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/security/keys", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_private_key",
    "Delete a private key",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).delete(`/security/keys/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );
}
