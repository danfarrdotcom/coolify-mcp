import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import type { Config } from "../config/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerCrossInstanceTools(server: McpServerLike, getClient: GetClient, _config: Config) {
  server.tool(
    "compare_apps",
    "Compare an application's config between two instances",
    {
      source_instance: z.string(),
      target_instance: z.string(),
      source_uuid: z.string(),
      target_uuid: z.string(),
    },
    async ({ source_instance, target_instance, source_uuid, target_uuid }) => {
      const [sourceApp, targetApp, sourceEnvs, targetEnvs] = await Promise.all([
        getClient(source_instance).get(`/applications/${source_uuid}`),
        getClient(target_instance).get(`/applications/${target_uuid}`),
        getClient(source_instance).get(`/applications/${source_uuid}/envs`),
        getClient(target_instance).get(`/applications/${target_uuid}/envs`),
      ]);

      const src = sourceApp as Record<string, unknown>;
      const tgt = targetApp as Record<string, unknown>;
      const compareFields = ["git_repository", "git_branch", "build_pack", "fqdn", "ports_exposes", "status"];

      const configDiff: Record<string, { source: unknown; target: unknown }> = {};
      for (const field of compareFields) {
        if (src[field] !== tgt[field]) {
          configDiff[field] = { source: src[field], target: tgt[field] };
        }
      }

      const srcEnvKeys = new Set((sourceEnvs as Array<Record<string, unknown>>).map((e) => String(e.key)));
      const tgtEnvKeys = new Set((targetEnvs as Array<Record<string, unknown>>).map((e) => String(e.key)));

      const envDiff = {
        only_in_source: [...srcEnvKeys].filter((k) => !tgtEnvKeys.has(k)),
        only_in_target: [...tgtEnvKeys].filter((k) => !srcEnvKeys.has(k)),
        in_both: [...srcEnvKeys].filter((k) => tgtEnvKeys.has(k)),
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ config_differences: configDiff, env_var_diff: envDiff }, null, 2),
        }],
      };
    },
  );

  server.tool(
    "clone_env_vars",
    "Copy environment variables from one app to another (across instances or same instance)",
    {
      source_instance: z.string(),
      target_instance: z.string(),
      source_uuid: z.string(),
      target_uuid: z.string(),
      overwrite: z.boolean().optional().describe("Overwrite existing vars on target (default: false)"),
    },
    async ({ source_instance, target_instance, source_uuid, target_uuid, overwrite }) => {
      const sourceEnvs = (await getClient(source_instance).get(`/applications/${source_uuid}/envs`)) as Array<Record<string, unknown>>;
      const targetClient = getClient(target_instance);

      const targetEnvs = (await targetClient.get(`/applications/${target_uuid}/envs`)) as Array<Record<string, unknown>>;
      const targetKeys = new Set(targetEnvs.map((e) => String(e.key)));

      const results: Array<{ key: string; action: string }> = [];

      for (const env of sourceEnvs) {
        const key = String(env.key);
        const value = String(env.value);

        if (targetKeys.has(key) && !overwrite) {
          results.push({ key, action: "skipped (exists)" });
          continue;
        }

        try {
          if (targetKeys.has(key)) {
            await targetClient.patch(`/applications/${target_uuid}/envs`, { key, value });
            results.push({ key, action: "updated" });
          } else {
            await targetClient.post(`/applications/${target_uuid}/envs`, { key, value, is_preview: env.is_preview ?? false });
            results.push({ key, action: "created" });
          }
        } catch (e) {
          results.push({ key, action: `error: ${(e as Error).message}` });
        }
      }

      return { content: [{ type: "text", text: JSON.stringify({ copied: results.filter((r) => r.action !== "skipped (exists)").length, results }, null, 2) }] };
    },
  );
}
