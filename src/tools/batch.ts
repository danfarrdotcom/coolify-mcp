import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerBatchTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "restart_project_apps",
    "Restart all applications in a project",
    { instance: z.string().optional(), project_uuid: z.string() },
    async ({ instance, project_uuid }) => {
      const client = getClient(instance);
      const project = (await client.get(`/projects/${project_uuid}`)) as Record<string, unknown>;
      const environments = (project.environments || []) as Array<Record<string, unknown>>;

      const results: Array<{ name: string; uuid: string; status: string }> = [];
      for (const env of environments) {
        const apps = ((env.applications || []) as Array<Record<string, unknown>>);
        for (const app of apps) {
          try {
            await client.get(`/applications/${app.uuid}/restart`);
            results.push({ name: String(app.name), uuid: String(app.uuid), status: "restarting" });
          } catch (e) {
            results.push({ name: String(app.name), uuid: String(app.uuid), status: `error: ${(e as Error).message}` });
          }
        }
      }

      return { content: [{ type: "text", text: JSON.stringify({ restarted: results.length, results }, null, 2) }] };
    },
  );

  server.tool(
    "stop_all_apps",
    "Emergency stop ALL running applications on an instance (requires confirmation: set confirm=true)",
    { instance: z.string().optional(), confirm: z.boolean().describe("Must be true to proceed") },
    async ({ instance, confirm }) => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Aborted. Set confirm=true to stop all applications." }] };
      }

      const client = getClient(instance);
      const apps = (await client.get("/applications")) as Array<Record<string, unknown>>;
      const results: Array<{ name: string; uuid: string; status: string }> = [];

      for (const app of apps) {
        if (app.status === "running") {
          try {
            await client.get(`/applications/${app.uuid}/stop`);
            results.push({ name: String(app.name), uuid: String(app.uuid), status: "stopping" });
          } catch (e) {
            results.push({ name: String(app.name), uuid: String(app.uuid), status: `error: ${(e as Error).message}` });
          }
        }
      }

      return { content: [{ type: "text", text: JSON.stringify({ stopped: results.length, results }, null, 2) }] };
    },
  );

  server.tool(
    "redeploy_project",
    "Redeploy all applications in a project with force rebuild",
    { instance: z.string().optional(), project_uuid: z.string() },
    async ({ instance, project_uuid }) => {
      const client = getClient(instance);
      const project = (await client.get(`/projects/${project_uuid}`)) as Record<string, unknown>;
      const environments = (project.environments || []) as Array<Record<string, unknown>>;

      const results: Array<{ name: string; uuid: string; status: string }> = [];
      for (const env of environments) {
        const apps = ((env.applications || []) as Array<Record<string, unknown>>);
        for (const app of apps) {
          try {
            await client.get(`/deploy?uuid=${app.uuid}&force=true`);
            results.push({ name: String(app.name), uuid: String(app.uuid), status: "deploying" });
          } catch (e) {
            results.push({ name: String(app.name), uuid: String(app.uuid), status: `error: ${(e as Error).message}` });
          }
        }
      }

      return { content: [{ type: "text", text: JSON.stringify({ deployed: results.length, results }, null, 2) }] };
    },
  );

  server.tool(
    "bulk_env_update_across_apps",
    "Set or update an environment variable across multiple applications",
    {
      instance: z.string().optional(),
      app_uuids: z.array(z.string()).describe("List of application UUIDs"),
      key: z.string(),
      value: z.string(),
      is_preview: z.boolean().optional(),
    },
    async ({ instance, app_uuids, key, value, is_preview }) => {
      const client = getClient(instance);
      const results: Array<{ uuid: string; status: string }> = [];

      for (const uuid of app_uuids) {
        try {
          await client.patch(`/applications/${uuid}/envs`, { key, value, is_preview: is_preview ?? false });
          results.push({ uuid, status: "updated" });
        } catch {
          try {
            await client.post(`/applications/${uuid}/envs`, { key, value, is_preview: is_preview ?? false });
            results.push({ uuid, status: "created" });
          } catch (e) {
            results.push({ uuid, status: `error: ${(e as Error).message}` });
          }
        }
      }

      return { content: [{ type: "text", text: JSON.stringify({ key, updated: results.length, results }, null, 2) }] };
    },
  );
}
