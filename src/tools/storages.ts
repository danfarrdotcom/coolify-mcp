import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerStorageTools(server: McpServerLike, getClient: GetClient) {
  server.tool(
    "list_storages",
    "List persistent and file storages for an application, database, or service",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "database", "service"]),
      uuid: z.string(),
    },
    async ({ instance, resource_type, uuid }) => {
      const prefix = resource_type === "application" ? "applications" : resource_type === "database" ? "databases" : "services";
      const storages = await getClient(instance).get(`/${prefix}/${uuid}/storages`);
      return { content: [{ type: "text", text: JSON.stringify(storages, null, 2) }] };
    },
  );

  server.tool(
    "create_storage",
    "Create a persistent volume or file storage",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "database", "service"]),
      uuid: z.string(),
      type: z.enum(["persistent", "file"]),
      mount_path: z.string(),
      name: z.string().optional().describe("Volume name (persistent only)"),
      host_path: z.string().optional(),
      content: z.string().optional().describe("File content (file type only)"),
      resource_uuid: z.string().optional().describe("Service sub-resource UUID (services only)"),
    },
    async ({ instance, resource_type, uuid, ...body }) => {
      const prefix = resource_type === "application" ? "applications" : resource_type === "database" ? "databases" : "services";
      const result = await getClient(instance).post(`/${prefix}/${uuid}/storages`, body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_storage",
    "Delete a storage volume",
    {
      instance: z.string().optional(),
      resource_type: z.enum(["application", "database", "service"]),
      uuid: z.string(),
      storage_uuid: z.string(),
    },
    async ({ instance, resource_type, uuid, storage_uuid }) => {
      const prefix = resource_type === "application" ? "applications" : resource_type === "database" ? "databases" : "services";
      const result = await getClient(instance).delete(`/${prefix}/${uuid}/storages/${storage_uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );
}
