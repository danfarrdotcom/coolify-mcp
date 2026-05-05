import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";
import { summarize } from "../utils/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerProjectTools(server: McpServerLike, getClient: GetClient) {
  server.tool(
    "list_projects",
    "List all projects (returns summary)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const projects = await getClient(instance).get("/projects");
      return { content: [{ type: "text", text: JSON.stringify(summarize(projects, "project"), null, 2) }] };
    },
  );

  server.tool(
    "get_project",
    "Get project details including environments",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const project = await getClient(instance).get(`/projects/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
    },
  );

  server.tool(
    "create_project",
    "Create a new project",
    { instance: z.string().optional(), name: z.string(), description: z.string().optional() },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/projects", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "update_project",
    "Update a project",
    { instance: z.string().optional(), uuid: z.string(), name: z.string().optional(), description: z.string().optional() },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).patch(`/projects/${uuid}`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_project",
    "Delete a project",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).delete(`/projects/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Environments ---
  server.tool(
    "list_environments",
    "List environments in a project",
    { instance: z.string().optional(), project_uuid: z.string() },
    async ({ instance, project_uuid }) => {
      const envs = await getClient(instance).get(`/projects/${project_uuid}/environments`);
      return { content: [{ type: "text", text: JSON.stringify(summarize(envs, "environment"), null, 2) }] };
    },
  );

  server.tool(
    "get_environment",
    "Get environment details",
    { instance: z.string().optional(), project_uuid: z.string(), environment: z.string().describe("Environment name or UUID") },
    async ({ instance, project_uuid, environment }) => {
      const env = await getClient(instance).get(`/projects/${project_uuid}/${environment}`);
      return { content: [{ type: "text", text: JSON.stringify(env, null, 2) }] };
    },
  );

  server.tool(
    "create_environment",
    "Create an environment in a project",
    { instance: z.string().optional(), project_uuid: z.string(), name: z.string() },
    async ({ instance, project_uuid, name }) => {
      const result = await getClient(instance).post(`/projects/${project_uuid}/environments`, { name });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_environment",
    "Delete an environment (must be empty)",
    { instance: z.string().optional(), project_uuid: z.string(), environment: z.string().describe("Environment name or UUID") },
    async ({ instance, project_uuid, environment }) => {
      const result = await getClient(instance).delete(`/projects/${project_uuid}/environments/${environment}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );
}
