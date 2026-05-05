import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import type { Config } from "../config/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerResources(server: McpServer, getClient: GetClient, config: Config) {
  // Infrastructure overview resource
  server.resource(
    "infrastructure",
    "coolify://infrastructure",
    { description: "Overview of all Coolify infrastructure across instances", mimeType: "application/json" },
    async () => {
      const overview: Record<string, unknown> = {};

      for (const inst of config.instances) {
        const client = getClient(inst.name);
        const [servers, projects, apps, databases, services] = await Promise.allSettled([
          client.get("/servers"),
          client.get("/projects"),
          client.get("/applications"),
          client.get("/databases"),
          client.get("/services"),
        ]);

        overview[inst.name] = {
          servers: servers.status === "fulfilled" ? servers.value : [],
          projects: projects.status === "fulfilled" ? projects.value : [],
          applications: apps.status === "fulfilled" ? apps.value : [],
          databases: databases.status === "fulfilled" ? databases.value : [],
          services: services.status === "fulfilled" ? services.value : [],
        };
      }

      return { contents: [{ uri: "coolify://infrastructure", text: JSON.stringify(overview, null, 2), mimeType: "application/json" }] };
    },
  );

  // Per-instance server list
  for (const inst of config.instances) {
    server.resource(
      `servers-${inst.name}`,
      `coolify://${inst.name}/servers`,
      { description: `Servers on ${inst.name} instance`, mimeType: "application/json" },
      async () => {
        const client = getClient(inst.name);
        const servers = await client.get("/servers");
        return { contents: [{ uri: `coolify://${inst.name}/servers`, text: JSON.stringify(servers, null, 2), mimeType: "application/json" }] };
      },
    );
  }
}
