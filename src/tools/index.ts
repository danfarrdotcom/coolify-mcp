import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import type { Config } from "../config/index.js";
import { z } from "zod";
import { maskSecrets } from "../client/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerTools(server: McpServer, getClient: GetClient, config: Config) {
  // --- Infrastructure ---
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

  // --- Servers ---
  server.tool(
    "list_servers",
    "List all servers",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const servers = await getClient(instance).get("/servers");
      return { content: [{ type: "text", text: JSON.stringify(servers, null, 2) }] };
    },
  );

  server.tool(
    "get_server",
    "Get server details",
    { instance: z.string().optional(), uuid: z.string().describe("Server UUID") },
    async ({ instance, uuid }) => {
      const server_data = await getClient(instance).get(`/servers/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(server_data, null, 2) }] };
    },
  );

  server.tool(
    "server_resources",
    "Get resources running on a server",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const resources = await getClient(instance).get(`/servers/${uuid}/resources`);
      return { content: [{ type: "text", text: JSON.stringify(resources, null, 2) }] };
    },
  );

  server.tool(
    "server_domains",
    "Get domains configured on a server",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const domains = await getClient(instance).get(`/servers/${uuid}/domains`);
      return { content: [{ type: "text", text: JSON.stringify(domains, null, 2) }] };
    },
  );

  server.tool(
    "validate_server",
    "Validate server connection",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/servers/${uuid}/validate`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  // --- Projects ---
  server.tool(
    "list_projects",
    "List all projects",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const projects = await getClient(instance).get("/projects");
      return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] };
    },
  );

  server.tool(
    "get_project",
    "Get project details",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const project = await getClient(instance).get(`/projects/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
    },
  );

  // --- Applications ---
  server.tool(
    "list_applications",
    "List all applications",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const apps = await getClient(instance).get("/applications");
      return { content: [{ type: "text", text: JSON.stringify(apps, null, 2) }] };
    },
  );

  server.tool(
    "get_application",
    "Get application details",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const app = await getClient(instance).get(`/applications/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(app, null, 2) }] };
    },
  );

  server.tool(
    "application_logs",
    "Get application logs",
    { instance: z.string().optional(), uuid: z.string(), lines: z.number().optional().describe("Number of log lines") },
    async ({ instance, uuid, lines }) => {
      const params = lines ? `?lines=${lines}` : "";
      const logs = await getClient(instance).get(`/applications/${uuid}/logs${params}`);
      return { content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] };
    },
  );

  server.tool(
    "start_application",
    "Start an application",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/applications/${uuid}/start`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "stop_application",
    "Stop an application",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/applications/${uuid}/stop`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "restart_application",
    "Restart an application",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/applications/${uuid}/restart`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Environment Variables (with secret masking) ---
  server.tool(
    "list_env_vars",
    "List environment variables for an application (values masked)",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const envs = await getClient(instance).get(`/applications/${uuid}/envs`);
      return { content: [{ type: "text", text: JSON.stringify(maskSecrets(envs), null, 2) }] };
    },
  );

  server.tool(
    "create_env_var",
    "Create an environment variable",
    {
      instance: z.string().optional(),
      uuid: z.string().describe("Application UUID"),
      key: z.string(),
      value: z.string(),
      is_preview: z.boolean().optional(),
      is_build_time: z.boolean().optional(),
    },
    async ({ instance, uuid, key, value, is_preview, is_build_time }) => {
      const result = await getClient(instance).post(`/applications/${uuid}/envs`, {
        key,
        value,
        is_preview: is_preview ?? false,
        is_build_time: is_build_time ?? false,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_env_var",
    "Delete an environment variable",
    { instance: z.string().optional(), uuid: z.string().describe("Application UUID"), env_uuid: z.string() },
    async ({ instance, uuid, env_uuid }) => {
      const result = await getClient(instance).delete(`/applications/${uuid}/envs/${env_uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Deployments ---
  server.tool(
    "list_deployments",
    "List deployments",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const deployments = await getClient(instance).get("/deployments");
      return { content: [{ type: "text", text: JSON.stringify(deployments, null, 2) }] };
    },
  );

  server.tool(
    "deploy",
    "Deploy an application",
    {
      instance: z.string().optional(),
      uuid: z.string(),
      force: z.boolean().optional().describe("Force rebuild"),
    },
    async ({ instance, uuid, force }) => {
      const body = force ? { force_rebuild: true } : undefined;
      const result = await getClient(instance).post(`/applications/${uuid}/deploy`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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

  // --- Databases ---
  server.tool(
    "list_databases",
    "List all databases",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const dbs = await getClient(instance).get("/databases");
      return { content: [{ type: "text", text: JSON.stringify(dbs, null, 2) }] };
    },
  );

  server.tool(
    "get_database",
    "Get database details",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const db = await getClient(instance).get(`/databases/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(db, null, 2) }] };
    },
  );

  server.tool(
    "start_database",
    "Start a database",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/databases/${uuid}/start`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "stop_database",
    "Stop a database",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/databases/${uuid}/stop`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "restart_database",
    "Restart a database",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/databases/${uuid}/restart`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Services ---
  server.tool(
    "list_services",
    "List all services",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const services = await getClient(instance).get("/services");
      return { content: [{ type: "text", text: JSON.stringify(services, null, 2) }] };
    },
  );

  server.tool(
    "get_service",
    "Get service details",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const service = await getClient(instance).get(`/services/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(service, null, 2) }] };
    },
  );

  server.tool(
    "start_service",
    "Start a service",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/services/${uuid}/start`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "stop_service",
    "Stop a service",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/services/${uuid}/stop`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "restart_service",
    "Restart a service",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/services/${uuid}/restart`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Teams ---
  server.tool(
    "list_teams",
    "List all teams",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const teams = await getClient(instance).get("/teams");
      return { content: [{ type: "text", text: JSON.stringify(teams, null, 2) }] };
    },
  );

  server.tool(
    "get_team",
    "Get team details with members",
    { instance: z.string().optional(), id: z.number() },
    async ({ instance, id }) => {
      const team = await getClient(instance).get(`/teams/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(team, null, 2) }] };
    },
  );
}
