import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "deploy-app",
    "Step-by-step workflow to deploy a new application",
    { repo: z.string().describe("Git repository URL"), branch: z.string().optional().describe("Branch name") },
    ({ repo, branch }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I want to deploy ${repo}${branch ? ` (branch: ${branch})` : ""} to Coolify.

Please help me:
1. List available servers and pick one
2. List projects or create a new one
3. Create the application with appropriate build pack
4. Set any required environment variables
5. Trigger the first deployment

Use the coolify MCP tools to execute each step.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "debug-app",
    "Diagnose a failing application",
    { app: z.string().describe("Application UUID or name") },
    ({ app }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Application "${app}" is having issues. Please diagnose:

1. Get the application details and check its status
2. Pull recent logs
3. Check recent deployments for failures
4. Review environment variables (check for missing required ones)
5. Check the server it's running on

Summarize findings and suggest fixes.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "env-diff",
    "Compare environment variables between two apps or instances",
    {
      source: z.string().describe("Source application UUID"),
      target: z.string().describe("Target application UUID"),
    },
    ({ source, target }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare environment variables between application ${source} and ${target}.

1. List env vars for both applications
2. Show which vars exist in source but not target
3. Show which vars exist in target but not source
4. Show vars with different values (without revealing actual values)

Present as a clear diff table.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "rollback",
    "Rollback an application to a previous deployment",
    { uuid: z.string().describe("Application UUID") },
    ({ uuid }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need to rollback application ${uuid}.

1. List recent deployments for this application
2. Show me the last 5 successful deployments with their commit SHAs
3. Let me pick which one to rollback to
4. Deploy that specific commit

Use the coolify MCP tools to execute.`,
          },
        },
      ],
    }),
  );
}
