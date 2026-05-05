import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import type { Config } from "../config/index.js";
import { summarize } from "../utils/index.js";

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
          servers: servers.status === "fulfilled" ? summarize(servers.value, "server") : [],
          projects: projects.status === "fulfilled" ? summarize(projects.value, "project") : [],
          applications: apps.status === "fulfilled" ? summarize(apps.value, "application") : [],
          databases: databases.status === "fulfilled" ? summarize(databases.value, "database") : [],
          services: services.status === "fulfilled" ? summarize(services.value, "service") : [],
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
        return { contents: [{ uri: `coolify://${inst.name}/servers`, text: JSON.stringify(summarize(servers, "server"), null, 2), mimeType: "application/json" }] };
      },
    );

    server.resource(
      `applications-${inst.name}`,
      `coolify://${inst.name}/applications`,
      { description: `Applications on ${inst.name} instance`, mimeType: "application/json" },
      async () => {
        const client = getClient(inst.name);
        const apps = await client.get("/applications");
        return { contents: [{ uri: `coolify://${inst.name}/applications`, text: JSON.stringify(summarize(apps, "application"), null, 2), mimeType: "application/json" }] };
      },
    );

    server.resource(
      `databases-${inst.name}`,
      `coolify://${inst.name}/databases`,
      { description: `Databases on ${inst.name} instance`, mimeType: "application/json" },
      async () => {
        const client = getClient(inst.name);
        const dbs = await client.get("/databases");
        return { contents: [{ uri: `coolify://${inst.name}/databases`, text: JSON.stringify(summarize(dbs, "database"), null, 2), mimeType: "application/json" }] };
      },
    );

    server.resource(
      `services-${inst.name}`,
      `coolify://${inst.name}/services`,
      { description: `Services on ${inst.name} instance`, mimeType: "application/json" },
      async () => {
        const client = getClient(inst.name);
        const services = await client.get("/services");
        return { contents: [{ uri: `coolify://${inst.name}/services`, text: JSON.stringify(summarize(services, "service"), null, 2), mimeType: "application/json" }] };
      },
    );
  }
}
