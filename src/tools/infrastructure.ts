import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import type { Config } from "../config/index.js";
import { z } from "zod";
import { summarize } from "../utils/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerInfrastructureTools(server: McpServerLike, getClient: GetClient, config: Config) {
  server.tool(
    "list_instances",
    "List all configured Coolify instances",
    {},
    async () => ({
      content: [{ type: "text", text: JSON.stringify(config.instances.map((i) => ({ name: i.name, baseUrl: i.baseUrl })), null, 2) }],
    }),
  );

  server.tool(
    "get_version",
    "Get Coolify API version",
    { instance: z.string().optional().describe("Instance name (uses default if omitted)") },
    async ({ instance }) => {
      const version = await getClient(instance).get("/version");
      return { content: [{ type: "text", text: JSON.stringify(version) }] };
    },
  );

  server.tool(
    "get_infrastructure_overview",
    "Get a high-level overview of all infrastructure across instances (servers, projects, apps, databases, services)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const instances = instance ? [{ name: instance }] : config.instances;
      const overview: Record<string, unknown> = {};

      for (const inst of instances) {
        const client = getClient(inst.name);
        const [servers, projects, apps, databases, services] = await Promise.allSettled([
          client.get("/servers"),
          client.get("/projects"),
          client.get("/applications"),
          client.get("/databases"),
          client.get("/services"),
        ]);

        overview[inst.name] = {
          servers: servers.status === "fulfilled" ? summarize(servers.value, "server") : [],
          projects: projects.status === "fulfilled" ? summarize(projects.value, "project") : [],
          applications: apps.status === "fulfilled" ? summarize(apps.value, "application") : [],
          databases: databases.status === "fulfilled" ? summarize(databases.value, "database") : [],
          services: services.status === "fulfilled" ? summarize(services.value, "service") : [],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(overview, null, 2) }] };
    },
  );
}
