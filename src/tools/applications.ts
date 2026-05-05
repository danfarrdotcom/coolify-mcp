import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";
import { summarize, resolveApp, withActions, appActions } from "../utils/index.js";
import { maskSecrets } from "../client/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerApplicationTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "list_applications",
    "List all applications (returns summary: uuid, name, fqdn, status)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const apps = await getClient(instance).get("/applications");
      return { content: [{ type: "text", text: JSON.stringify(summarize(apps, "application"), null, 2) }] };
    },
  );

  server.tool(
    "get_application",
    "Get full application details. Accepts UUID, name, or domain.",
    { instance: z.string().optional(), identifier: z.string().describe("Application UUID, name, or domain") },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveApp(client, identifier);
      const app = await client.get(`/applications/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(withActions(app, appActions(uuid)), null, 2) }] };
    },
  );

  server.tool(
    "create_application_public",
    "Create application from a public git repository",
    {
      instance: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      git_repository: z.string(),
      git_branch: z.string(),
      build_pack: z.enum(["nixpacks", "static", "dockerfile", "dockercompose"]),
      ports_exposes: z.string().describe("Ports to expose (e.g. '3000')"),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/applications/public", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "create_application_docker_image",
    "Create application from a Docker image",
    {
      instance: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      docker_registry_image_name: z.string(),
      docker_registry_image_tag: z.string().optional(),
      ports_exposes: z.string(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/applications/dockerimage", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "create_application_dockerfile",
    "Create application from a Dockerfile (without git)",
    {
      instance: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      dockerfile: z.string().describe("Dockerfile content"),
      ports_exposes: z.string(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/applications/dockerfile", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "create_application_private_github",
    "Create application from a private GitHub repo (via GitHub App)",
    {
      instance: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      github_app_uuid: z.string(),
      git_repository: z.string(),
      git_branch: z.string(),
      build_pack: z.enum(["nixpacks", "static", "dockerfile", "dockercompose"]),
      ports_exposes: z.string(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/applications/private-github-app", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "create_application_private_key",
    "Create application from a private repo via deploy key",
    {
      instance: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      private_key_uuid: z.string(),
      git_repository: z.string(),
      git_branch: z.string(),
      build_pack: z.enum(["nixpacks", "static", "dockerfile", "dockercompose"]),
      ports_exposes: z.string(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/applications/private-deploy-key", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "update_application",
    "Update application settings (git branch, domains, build pack, etc.)",
    {
      instance: z.string().optional(),
      uuid: z.string(),
      git_repository: z.string().optional(),
      git_branch: z.string().optional(),
      ports_exposes: z.string().optional(),
      build_pack: z.enum(["nixpacks", "static", "dockerfile", "dockercompose"]).optional(),
    },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).patch(`/applications/${uuid}`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_application",
    "Delete an application",
    {
      instance: z.string().optional(),
      uuid: z.string(),
      delete_volumes: z.boolean().optional(),
      docker_cleanup: z.boolean().optional(),
    },
    async ({ instance, uuid, delete_volumes, docker_cleanup }) => {
      const params = new URLSearchParams();
      if (delete_volumes !== undefined) params.set("delete_volumes", String(delete_volumes));
      if (docker_cleanup !== undefined) params.set("docker_cleanup", String(docker_cleanup));
      const qs = params.toString() ? `?${params}` : "";
      const result = await getClient(instance).delete(`/applications/${uuid}${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "application_logs",
    "Get application logs",
    {
      instance: z.string().optional(),
      identifier: z.string().describe("Application UUID, name, or domain"),
      lines: z.number().optional().describe("Number of log lines (default: 100)"),
    },
    async ({ instance, identifier, lines }) => {
      const client = getClient(instance);
      const uuid = await resolveApp(client, identifier);
      const params = lines ? `?lines=${lines}` : "";
      const logs = await client.get(`/applications/${uuid}/logs${params}`);
      return { content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] };
    },
  );

  server.tool(
    "start_application",
    "Start an application",
    { instance: z.string().optional(), uuid: z.string(), force: z.boolean().optional() },
    async ({ instance, uuid, force }) => {
      const params = force ? "?force=true" : "";
      const result = await getClient(instance).get(`/applications/${uuid}/start${params}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "stop_application",
    "Stop an application",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/applications/${uuid}/stop`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "restart_application",
    "Restart an application",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/applications/${uuid}/restart`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Environment Variables ---
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
    "Create an environment variable for an application",
    {
      instance: z.string().optional(),
      uuid: z.string().describe("Application UUID"),
      key: z.string(),
      value: z.string(),
      is_preview: z.boolean().optional(),
      is_build_time: z.boolean().optional(),
      is_literal: z.boolean().optional(),
    },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).post(`/applications/${uuid}/envs`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "update_env_var",
    "Update an environment variable for an application",
    {
      instance: z.string().optional(),
      uuid: z.string().describe("Application UUID"),
      key: z.string(),
      value: z.string(),
      is_preview: z.boolean().optional(),
      is_literal: z.boolean().optional(),
    },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).patch(`/applications/${uuid}/envs`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "bulk_update_env_vars",
    "Bulk update environment variables for an application",
    {
      instance: z.string().optional(),
      uuid: z.string().describe("Application UUID"),
      data: z.array(z.object({ key: z.string(), value: z.string(), is_preview: z.boolean().optional(), is_literal: z.boolean().optional() })),
    },
    async ({ instance, uuid, data }) => {
      const result = await getClient(instance).patch(`/applications/${uuid}/envs/bulk`, { data });
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
}
