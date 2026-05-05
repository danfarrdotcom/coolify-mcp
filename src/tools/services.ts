import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";
import { summarize, resolveService, withActions, serviceActions } from "../utils/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerServiceTools(server: McpServerLike, getClient: GetClient) {
  server.tool(
    "list_services",
    "List all services (returns summary)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const services = await getClient(instance).get("/services");
      return { content: [{ type: "text", text: JSON.stringify(summarize(services, "service"), null, 2) }] };
    },
  );

  server.tool(
    "get_service",
    "Get full service details. Accepts UUID or name.",
    { instance: z.string().optional(), identifier: z.string().describe("Service UUID or name") },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveService(client, identifier);
      const svc = await client.get(`/services/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(withActions(svc, serviceActions(uuid)), null, 2) }] };
    },
  );

  server.tool(
    "create_service",
    "Create a one-click or custom service",
    {
      instance: z.string().optional(),
      type: z.string().optional().describe("One-click service type (e.g. 'gitea', 'plausible')"),
      name: z.string().optional(),
      description: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/services", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "update_service",
    "Update a service",
    {
      instance: z.string().optional(),
      uuid: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      instant_deploy: z.boolean().optional(),
    },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).patch(`/services/${uuid}`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_service",
    "Delete a service",
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
      const result = await getClient(instance).delete(`/services/${uuid}${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "start_service",
    "Start a service",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/services/${uuid}/start`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "stop_service",
    "Stop a service",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/services/${uuid}/stop`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "restart_service",
    "Restart a service",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/services/${uuid}/restart`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );
}
