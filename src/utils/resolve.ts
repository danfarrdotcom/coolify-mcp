/**
 * Smart lookup: resolve human-friendly identifiers (name, domain, IP) to UUIDs.
 */
import type { CoolifyClient } from "../client/index.js";

const UUID_REGEX = /^[a-z0-9]{7,}$/;

export async function resolveApp(client: CoolifyClient, identifier: string): Promise<string> {
  if (UUID_REGEX.test(identifier)) return identifier;

  const apps = (await client.get("/applications")) as Array<Record<string, unknown>>;
  const match =
    apps.find((a) => a.name === identifier) ||
    apps.find((a) => typeof a.fqdn === "string" && a.fqdn.includes(identifier)) ||
    apps.find((a) => typeof a.name === "string" && a.name.toLowerCase().includes(identifier.toLowerCase()));

  if (!match) throw new Error(`Could not resolve application "${identifier}". Try using a UUID.`);
  return match.uuid as string;
}

export async function resolveServer(client: CoolifyClient, identifier: string): Promise<string> {
  if (UUID_REGEX.test(identifier)) return identifier;

  const servers = (await client.get("/servers")) as Array<Record<string, unknown>>;
  const match =
    servers.find((s) => s.name === identifier) ||
    servers.find((s) => s.ip === identifier) ||
    servers.find((s) => typeof s.name === "string" && s.name.toLowerCase().includes(identifier.toLowerCase()));

  if (!match) throw new Error(`Could not resolve server "${identifier}". Try using a UUID.`);
  return match.uuid as string;
}

export async function resolveDatabase(client: CoolifyClient, identifier: string): Promise<string> {
  if (UUID_REGEX.test(identifier)) return identifier;

  const dbs = (await client.get("/databases")) as Array<Record<string, unknown>>;
  const match =
    dbs.find((d) => d.name === identifier) ||
    dbs.find((d) => typeof d.name === "string" && d.name.toLowerCase().includes(identifier.toLowerCase()));

  if (!match) throw new Error(`Could not resolve database "${identifier}". Try using a UUID.`);
  return match.uuid as string;
}

export async function resolveService(client: CoolifyClient, identifier: string): Promise<string> {
  if (UUID_REGEX.test(identifier)) return identifier;

  const services = (await client.get("/services")) as Array<Record<string, unknown>>;
  const match =
    services.find((s) => s.name === identifier) ||
    services.find((s) => typeof s.name === "string" && s.name.toLowerCase().includes(identifier.toLowerCase()));

  if (!match) throw new Error(`Could not resolve service "${identifier}". Try using a UUID.`);
  return match.uuid as string;
}
