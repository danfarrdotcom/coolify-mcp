import type { McpServerLike } from "../types/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import type { Config } from "../config/index.js";
import { registerInfrastructureTools } from "./infrastructure.js";
import { registerServerTools } from "./servers.js";
import { registerProjectTools } from "./projects.js";
import { registerApplicationTools } from "./applications.js";
import { registerDatabaseTools } from "./databases.js";
import { registerServiceTools } from "./services.js";
import { registerDeploymentTools } from "./deployments.js";
import { registerDiagnosticTools } from "./diagnostics.js";
import { registerBatchTools } from "./batch.js";
import { registerScheduledTaskTools } from "./scheduled-tasks.js";
import { registerStorageTools } from "./storages.js";
import { registerGithubAppTools } from "./github-apps.js";
import { registerPrivateKeyTools } from "./private-keys.js";
import { registerTeamTools } from "./teams.js";
import { registerCloudTokenTools } from "./cloud-tokens.js";
import { registerCrossInstanceTools } from "./cross-instance.js";
import { registerDocsTools } from "./docs.js";

type GetClient = (name?: string) => CoolifyClient;

export function registerTools(server: McpServerLike, getClient: GetClient, config: Config) {
  registerInfrastructureTools(server, getClient, config);
  registerServerTools(server, getClient);
  registerProjectTools(server, getClient);
  registerApplicationTools(server, getClient);
  registerDatabaseTools(server, getClient);
  registerServiceTools(server, getClient);
  registerDeploymentTools(server, getClient);
  registerDiagnosticTools(server, getClient);
  registerBatchTools(server, getClient);
  registerScheduledTaskTools(server, getClient);
  registerStorageTools(server, getClient);
  registerGithubAppTools(server, getClient);
  registerPrivateKeyTools(server, getClient);
  registerTeamTools(server, getClient);
  registerCloudTokenTools(server, getClient);
  registerCrossInstanceTools(server, getClient, config);
  registerDocsTools(server);
}
