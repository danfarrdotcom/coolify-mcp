import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerScheduledTaskTools(server: McpServerLike, getClient: GetClient) {
  server.tool(
    "list_scheduled_tasks",
    "List scheduled tasks for an application or service",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "service"]),
      uuid: z.string().describe("Application or service UUID"),
    },
    async ({ instance, resource_type, uuid }) => {
      const path = resource_type === "application" ? `/applications/${uuid}/scheduled-tasks` : `/services/${uuid}/scheduled-tasks`;
      const tasks = await getClient(instance).get(path);
      return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
    },
  );

  server.tool(
    "create_scheduled_task",
    "Create a scheduled task for an application or service",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "service"]),
      uuid: z.string(),
      name: z.string(),
      command: z.string(),
      frequency: z.string().describe("Cron expression"),
      container: z.string().optional(),
      enabled: z.boolean().optional(),
    },
    async ({ instance, resource_type, uuid, ...body }) => {
      const path = resource_type === "application" ? `/applications/${uuid}/scheduled-tasks` : `/services/${uuid}/scheduled-tasks`;
      const result = await getClient(instance).post(path, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "update_scheduled_task",
    "Update a scheduled task",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "service"]),
      uuid: z.string(),
      task_uuid: z.string(),
      name: z.string().optional(),
      command: z.string().optional(),
      frequency: z.string().optional(),
      enabled: z.boolean().optional(),
    },
    async ({ instance, resource_type, uuid, task_uuid, ...body }) => {
      const path = resource_type === "application" ? `/applications/${uuid}/scheduled-tasks/${task_uuid}` : `/services/${uuid}/scheduled-tasks/${task_uuid}`;
      const result = await getClient(instance).patch(path, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_scheduled_task",
    "Delete a scheduled task",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "service"]),
      uuid: z.string(),
      task_uuid: z.string(),
    },
    async ({ instance, resource_type, uuid, task_uuid }) => {
      const path = resource_type === "application" ? `/applications/${uuid}/scheduled-tasks/${task_uuid}` : `/services/${uuid}/scheduled-tasks/${task_uuid}`;
      const result = await getClient(instance).delete(path);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "list_scheduled_task_executions",
    "List executions for a scheduled task",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "service"]),
      uuid: z.string(),
      task_uuid: z.string(),
    },
    async ({ instance, resource_type, uuid, task_uuid }) => {
      const path = resource_type === "application"
        ? `/applications/${uuid}/scheduled-tasks/${task_uuid}/executions`
        : `/services/${uuid}/scheduled-tasks/${task_uuid}/executions`;
      const execs = await getClient(instance).get(path);
      return { content: [{ type: "text", text: JSON.stringify(execs, null, 2) }] };
    },
  );
}
