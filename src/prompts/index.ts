import type { McpServerLike } from "../types/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServerLike) {
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
    { app: z.string().describe("Application UUID, name, or domain") },
    ({ app }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Application "${app}" is having issues. Please run diagnose_app to get comprehensive diagnostics, then:

1. Check application status
2. Analyze recent logs for errors
3. Review recent deployments for failures
4. Check environment variables for missing required ones
5. Summarize findings and suggest fixes.`,
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

1. Use list_deployments_for_app to get recent deployments
2. Show me the last 5 successful deployments with their commit SHAs
3. Let me pick which one to rollback to
4. Deploy that specific commit

Use the coolify MCP tools to execute.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "migrate-app",
    "Migrate an application between Coolify instances",
    {
      app: z.string().describe("Application UUID or name"),
      source_instance: z.string().describe("Source instance name"),
      target_instance: z.string().describe("Target instance name"),
    },
    ({ app, source_instance, target_instance }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Migrate application "${app}" from ${source_instance} to ${target_instance}.

1. Get full application details from source instance
2. List env vars from source (note the keys needed)
3. List available servers on target instance
4. Create the application on target with same git repo/branch/build pack
5. Copy environment variables to target
6. Deploy on target
7. Verify deployment succeeded

Use the coolify MCP tools with the instance parameter to work across instances.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "provision-server",
    "Set up a new server from scratch",
    { name: z.string().optional().describe("Server name"), ip: z.string().optional().describe("Server IP (if existing)") },
    ({ name, ip }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I want to set up a new server${name ? ` called "${name}"` : ""}${ip ? ` at ${ip}` : ""}.

1. List available private keys (or create one if needed)
2. Create the server in Coolify
3. Validate the server connection
4. Show server resources to confirm it's ready
5. Suggest next steps (create a project, deploy an app)

Use the coolify MCP tools to execute each step.`,
          },
        },
      ],
    }),
  );
}
