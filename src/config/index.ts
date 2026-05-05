import { z } from "zod";

const InstanceSchema = z.object({
  name: z.string(),
  baseUrl: z.string().url(),
  token: z.string().min(1),
});

export type CoolifyInstance = z.infer<typeof InstanceSchema>;

export interface Config {
  instances: CoolifyInstance[];
  defaultInstance: string;
}

export function loadConfig(): Config {
  const instancesEnv = process.env.COOLIFY_INSTANCES;

  if (instancesEnv) {
    const instances = instancesEnv.split(",").map((entry) => {
      const [name, rest] = entry.split("=");
      const [baseUrl, token] = rest.split("|");
      return InstanceSchema.parse({ name: name.trim(), baseUrl: baseUrl.trim(), token: token.trim() });
    });
    return { instances, defaultInstance: instances[0].name };
  }

  const baseUrl = process.env.COOLIFY_BASE_URL || "http://localhost:3000";
  const token = process.env.COOLIFY_ACCESS_TOKEN;

  if (!token) {
    throw new Error("COOLIFY_ACCESS_TOKEN or COOLIFY_INSTANCES must be set");
  }

  const instance = InstanceSchema.parse({ name: "default", baseUrl, token });
  return { instances: [instance], defaultInstance: "default" };
}
