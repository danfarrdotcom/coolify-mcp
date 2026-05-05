import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";
import { resolveApp, resolveServer } from "../utils/index.js";
import { maskSecrets } from "../client/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerDiagnosticTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "diagnose_app",
    "Comprehensive app diagnostics: status, recent logs, recent deployments, env vars. Accepts UUID, name, or domain.",
    {
      instance: z.string().optional(),
      identifier: z.string().describe("Application UUID, name, or domain"),
    },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveApp(client, identifier);

      const [app, logs, deployments, envs] = await Promise.allSettled([
        client.get(`/applications/${uuid}`),
        client.get(`/applications/${uuid}/logs?lines=50`),
        client.get(`/deployments/applications/${uuid}?take=5`),
        client.get(`/applications/${uuid}/envs`),
      ]);

      const result = {
        application: app.status === "fulfilled" ? app.value : { error: (app as PromiseRejectedResult).reason?.message },
        recent_logs: logs.status === "fulfilled" ? logs.value : { error: (logs as PromiseRejectedResult).reason?.message },
        recent_deployments: deployments.status === "fulfilled" ? deployments.value : { error: (deployments as PromiseRejectedResult).reason?.message },
        env_vars: envs.status === "fulfilled" ? maskSecrets(envs.value) : { error: (envs as PromiseRejectedResult).reason?.message },
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "diagnose_server",
    "Comprehensive server diagnostics: status, resources, domains, validation. Accepts UUID, name, or IP.",
    {
      instance: z.string().optional(),
      identifier: z.string().describe("Server UUID, name, or IP"),
    },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveServer(client, identifier);

      const [srv, resources, domains, validation] = await Promise.allSettled([
        client.get(`/servers/${uuid}`),
        client.get(`/servers/${uuid}/resources`),
        client.get(`/servers/${uuid}/domains`),
        client.get(`/servers/${uuid}/validate`),
      ]);

      const result = {
        server: srv.status === "fulfilled" ? srv.value : { error: (srv as PromiseRejectedResult).reason?.message },
        resources: resources.status === "fulfilled" ? resources.value : { error: (resources as PromiseRejectedResult).reason?.message },
        domains: domains.status === "fulfilled" ? domains.value : { error: (domains as PromiseRejectedResult).reason?.message },
        validation: validation.status === "fulfilled" ? validation.value : { error: (validation as PromiseRejectedResult).reason?.message },
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "find_issues",
    "Scan infrastructure for unhealthy apps, databases, services, and unreachable servers",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const client = getClient(instance);

      const [apps, dbs, services, servers] = await Promise.allSettled([
        client.get("/applications"),
        client.get("/databases"),
        client.get("/services"),
        client.get("/servers"),
      ]);

      const issues: Array<{ type: string; name: string; uuid: string; issue: string }> = [];

      if (apps.status === "fulfilled" && Array.isArray(apps.value)) {
        for (const app of apps.value as Array<Record<string, unknown>>) {
          if (app.status && !["running", "starting"].includes(String(app.status))) {
            issues.push({ type: "application", name: String(app.name || ""), uuid: String(app.uuid || ""), issue: `Status: ${app.status}` });
          }
        }
      }

      if (dbs.status === "fulfilled" && Array.isArray(dbs.value)) {
        for (const db of dbs.value as Array<Record<string, unknown>>) {
          if (db.status && !["running", "starting"].includes(String(db.status))) {
            issues.push({ type: "database", name: String(db.name || ""), uuid: String(db.uuid || ""), issue: `Status: ${db.status}` });
          }
        }
      }

      if (services.status === "fulfilled" && Array.isArray(services.value)) {
        for (const svc of services.value as Array<Record<string, unknown>>) {
          if (svc.status && !["running", "starting"].includes(String(svc.status))) {
            issues.push({ type: "service", name: String(svc.name || ""), uuid: String(svc.uuid || ""), issue: `Status: ${svc.status}` });
          }
        }
      }

      if (servers.status === "fulfilled" && Array.isArray(servers.value)) {
        for (const srv of servers.value as Array<Record<string, unknown>>) {
          if (srv.is_reachable === false) {
            issues.push({ type: "server", name: String(srv.name || ""), uuid: String(srv.uuid || ""), issue: "Unreachable" });
          }
        }
      }

      const summary = issues.length === 0 ? "No issues found. All resources appear healthy." : `Found ${issues.length} issue(s).`;

      return { content: [{ type: "text", text: JSON.stringify({ summary, issues }, null, 2) }] };
    },
  );
}
