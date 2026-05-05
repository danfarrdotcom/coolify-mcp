import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerGithubAppTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "list_github_apps",
    "List all GitHub App integrations",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const apps = await getClient(instance).get("/github-apps");
      return { content: [{ type: "text", text: JSON.stringify(apps, null, 2) }] };
    },
  );

  server.tool(
    "list_github_repos",
    "List repositories available through a GitHub App",
    { instance: z.string().optional(), github_app_id: z.number() },
    async ({ instance, github_app_id }) => {
      const repos = await getClient(instance).get(`/github-apps/${github_app_id}/repositories`);
      return { content: [{ type: "text", text: JSON.stringify(repos, null, 2) }] };
    },
  );

  server.tool(
    "list_github_branches",
    "List branches for a repository via GitHub App",
    { instance: z.string().optional(), github_app_id: z.number(), owner: z.string(), repo: z.string() },
    async ({ instance, github_app_id, owner, repo }) => {
      const branches = await getClient(instance).get(`/github-apps/${github_app_id}/repositories/${owner}/${repo}/branches`);
      return { content: [{ type: "text", text: JSON.stringify(branches, null, 2) }] };
    },
  );

  server.tool(
    "delete_github_app",
    "Delete a GitHub App integration",
    { instance: z.string().optional(), github_app_id: z.number() },
    async ({ instance, github_app_id }) => {
      const result = await getClient(instance).delete(`/github-apps/${github_app_id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  );
}
