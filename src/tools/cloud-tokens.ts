import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerCloudTokenTools(server: McpServerLike, getClient: GetClient) {
  server.tool(
    "list_cloud_tokens",
    "List cloud provider tokens (Hetzner/DigitalOcean)",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const tokens = await getClient(instance).get("/cloud-tokens");
      return { content: [{ type: "text", text: JSON.stringify(tokens, null, 2) }] };
    },
  );

  server.tool(
    "create_cloud_token",
    "Create a cloud provider token",
    {
      instance: z.string().optional(),
      provider: z.enum(["hetzner", "digitalocean"]),
      name: z.string(),
      token: z.string(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/cloud-tokens", body);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "validate_cloud_token",
    "Validate a cloud provider token against the provider API",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).post(`/cloud-tokens/${uuid}/validate`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  server.tool(
    "delete_cloud_token",
    "Delete a cloud provider token",
    { instance: z.string().optional(), uuid: z.string() },
    async ({ instance, uuid }) => {
      const result = await getClient(instance).delete(`/cloud-tokens/${uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );

  // --- Hetzner provisioning ---
  server.tool(
    "hetzner_locations",
    "List available Hetzner datacenter locations",
    { instance: z.string().optional(), cloud_provider_token_uuid: z.string() },
    async ({ instance, cloud_provider_token_uuid }) => {
      const locations = await getClient(instance).get(`/hetzner/locations?cloud_provider_token_uuid=${cloud_provider_token_uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(locations, null, 2) }] };
    },
  );

  server.tool(
    "hetzner_server_types",
    "List available Hetzner server types (sizes and pricing)",
    { instance: z.string().optional(), cloud_provider_token_uuid: z.string() },
    async ({ instance, cloud_provider_token_uuid }) => {
      const types = await getClient(instance).get(`/hetzner/server-types?cloud_provider_token_uuid=${cloud_provider_token_uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(types, null, 2) }] };
    },
  );

  server.tool(
    "hetzner_images",
    "List available Hetzner OS images",
    { instance: z.string().optional(), cloud_provider_token_uuid: z.string() },
    async ({ instance, cloud_provider_token_uuid }) => {
      const images = await getClient(instance).get(`/hetzner/images?cloud_provider_token_uuid=${cloud_provider_token_uuid}`);
      return { content: [{ type: "text", text: JSON.stringify(images, null, 2) }] };
    },
  );

  server.tool(
    "create_hetzner_server",
    "Provision a new Hetzner server and register it in Coolify",
    {
      instance: z.string().optional(),
      cloud_provider_token_uuid: z.string(),
      location: z.string().describe("Hetzner location (e.g. nbg1, fsn1, hel1)"),
      server_type: z.string().describe("Server type (e.g. cx11, cx21, cpx11)"),
      image: z.number().describe("Hetzner image ID"),
      private_key_uuid: z.string(),
      name: z.string().optional(),
      instant_validate: z.boolean().optional(),
    },
    async ({ instance, ...body }) => {
      const result = await getClient(instance).post("/servers/hetzner", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
