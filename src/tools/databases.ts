import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";
import { summarize, resolveDatabase, withActions, dbActions } from "../utils/index.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerDatabaseTools(server: McpServerLike, getClient: GetClient) {
  server.tool(
    "list_databases",
    "List all databases (returns summary)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const dbs = await getClient(instance).get("/databases");
      return { content: [{ type: "text", text: JSON.stringify(summarize(dbs, "database"), null, 2) }] };
    },
  );

  server.tool(
    "get_database",
    "Get full database details. Accepts UUID or name.",
    { instance: z.string().optional(), identifier: z.string().describe("Database UUID or name") },
    async ({ instance, identifier }) => {
      const client = getClient(instance);
      const uuid = await resolveDatabase(client, identifier);
      const db = await client.get(`/databases/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(withActions(db, dbActions(uuid)), null, 2) }] };
    },
  );

  server.tool(
    "create_database",
    "Create a new database",
    {
      instance: z.string().optional(),
      type: z.enum(["postgresql", "mysql", "mariadb", "mongodb", "redis", "keydb", "clickhouse", "dragonfly"]),
      server_uuid: z.string(),
      project_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      name: z.string().optional(),
      image: z.string().optional(),
      is_public: z.boolean().optional(),
      public_port: z.number().optional(),
      instant_deploy: z.boolean().optional(),
    },
    async ({ instance, type, ...body }) => {
      const result = await getClient(instance).post(`/databases/${type}`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "update_database",
    "Update database settings",
    {
      instance: z.string().optional(),
      uuid: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      is_public: z.boolean().optional(),
      public_port: z.number().optional(),
    },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).patch(`/databases/${uuid}`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_database",
    "Delete a database",
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
      const result = await getClient(instance).delete(`/databases/${uuid}${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "start_database",
    "Start a database",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/databases/${uuid}/start`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "stop_database",
    "Stop a database",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/databases/${uuid}/stop`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "restart_database",
    "Restart a database",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).get(`/databases/${uuid}/restart`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Backups ---
  server.tool(
    "list_database_backups",
    "List backup configurations for a database",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const backups = await getClient(instance).get(`/databases/${uuid}/backups`);
      return { content: [{ type: "text", text: JSON.stringify(backups, null, 2) }] };
    },
  );

  server.tool(
    "create_database_backup",
    "Create a backup schedule for a database",
    {
      instance: z.string().optional(),
      uuid: z.string(),
      frequency: z.string().describe("Cron expression or: every_minute, hourly, daily, weekly, monthly, yearly"),
      enabled: z.boolean().optional(),
      save_s3: z.boolean().optional(),
      s3_storage_uuid: z.string().optional(),
      databases_to_backup: z.string().optional(),
    },
    async ({ instance, uuid, ...body }) => {
      const result = await getClient(instance).post(`/databases/${uuid}/backups`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_database_backup",
    "Delete a backup configuration",
    { instance: z.string().optional(), uuid: z.string(), backup_uuid: z.string() },
    async ({ instance, uuid, backup_uuid }) => {
      const result = await getClient(instance).delete(`/databases/${uuid}/backups/${backup_uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "list_backup_executions",
    "List executions for a backup schedule",
    { instance: z.string().optional(), uuid: z.string(), backup_uuid: z.string() },
    async ({ instance, uuid, backup_uuid }) => {
      const execs = await getClient(instance).get(`/databases/${uuid}/backups/${backup_uuid}/executions`);
      return { content: [{ type: "text", text: JSON.stringify(execs, null, 2) }] };
    },
  );
}
