import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CoolifyClient } from "../client/index.js";
import { z } from "zod";

type GetClient = (name?: string) => CoolifyClient;

export function registerTeamTools(server: McpServer, getClient: GetClient) {
  server.tool(
    "list_teams",
    "List all teams",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const teams = await getClient(instance).get("/teams");
      return { content: [{ type: "text", text: JSON.stringify(teams, null, 2) }] };
    },
  );

  server.tool(
    "get_team",
    "Get team details",
    { instance: z.string().optional(), id: z.number() },
    async ({ instance, id }) => {
      const team = await getClient(instance).get(`/teams/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(team, null, 2) }] };
    },
  );

  server.tool(
    "get_team_members",
    "Get team members",
    { instance: z.string().optional(), id: z.number() },
    async ({ instance, id }) => {
      const members = await getClient(instance).get(`/teams/${id}/members`);
      return { content: [{ type: "text", text: JSON.stringify(members, null, 2) }] };
    },
  );

  server.tool(
    "get_current_team",
    "Get the currently authenticated team",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const team = await getClient(instance).get("/teams/current");
      return { content: [{ type: "text", text: JSON.stringify(team, null, 2) }] };
    },
  );

  server.tool(
    "get_current_team_members",
    "Get members of the currently authenticated team",
    { instance: z.string().optional() },
    async ({ instance }) => {
      const members = await getClient(instance).get("/teams/current/members");
      return { content: [{ type: "text", text: JSON.stringify(members, null, 2) }] };
    },
  );
}
