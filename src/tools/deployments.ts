import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";
import { summarize } from "../utils/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerDeploymentTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "list_deployments",
    "List currently running deployments (returns summary)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const deployments = await getClient(instance).get("/deployments");
      return { content: [{ type: "text", text: JSON.stringify(summarize(deployments, "deployment"), null, 2) }] };
    },
  );

  server.tool(
    "get_deployment",
    "Get deployment details and logs",
    { instance: z.string().optional(), uuid: z.string().describe("Deployment UUID") },
    async ({ instance, uuid }) => {
      const deployment = await getClient(instance).get(`/deployments/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(deployment, null, 2) }] };
    },
  );

  server.tool(
    "list_deployments_for_app",
    "List deployment history for an application",
    {
      instance: z.string().optional(),
      uuid: z.string().describe("Application UUID"),
      skip: z.number().optional().describe("Records to skip (default: 0)"),
      take: z.number().optional().describe("Records to take (default: 10)"),
    },
    async ({ instance, uuid, skip, take }) => {
      const params = new URLSearchParams();
      if (skip !== undefined) params.set("skip", String(skip));
      if (take !== undefined) params.set("take", String(take));
      const qs = params.toString() ? `?${params}` : "";
      const deployments = await getClient(instance).get(`/deployments/applications/${uuid}${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(summarize(deployments, "deployment"), null, 2) }] };
    },
  );

  server.tool(
    "deploy",
    "Deploy an application (by UUID or tag)",
    {
      instance: z.string().optional(),
      uuid: z.string().optional().describe("Application UUID"),
      tag: z.string().optional().describe("Tag name to deploy"),
      force: z.boolean().optional().describe("Force rebuild without cache"),
    },
    async ({ instance, uuid, tag, force }) => {
      const params = new URLSearchParams();
      if (uuid) params.set("uuid", uuid);
      if (tag) params.set("tag", tag);
      if (force) params.set("force", "true");
      const result = await getClient(instance).get(`/deploy?${params}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "cancel_deployment",
    "Cancel a running deployment",
    { instance: z.string().optional(), uuid: z.string().describe("Deployment UUID") },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/deployments/${uuid}/cancel`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );
}
