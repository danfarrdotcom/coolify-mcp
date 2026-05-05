# @drfarr/coolify-mcp

A better MCP server for [Coolify](https://coolify.io) — the open-source self-hosted PaaS.

## What's different

- **Multi-instance** — manage staging + production Coolify from one MCP server
- **MCP Resources** — subscribe to server state, app logs, infrastructure overview
- **MCP Prompts** — pre-built workflows for common tasks
- **Streaming logs** — real-time deployment/app output
- **Secret masking** — env var values never leak in responses
- **Full API coverage** — webhooks, notifications, destinations, tags, volumes
- **OpenAPI-generated types** — auto-synced with Coolify releases
- **Operational workflows** — rollback, env diff, clone app, export config

## Quick start

```bash
npm install @drfarr/coolify-mcp
```

### Claude Desktop

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "@drfarr/coolify-mcp"],
      "env": {
        "COOLIFY_BASE_URL": "https://your-coolify.com",
        "COOLIFY_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

### Multi-instance

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "@drfarr/coolify-mcp"],
      "env": {
        "COOLIFY_INSTANCES": "prod=https://coolify.example.com|token1,staging=https://staging.coolify.example.com|token2"
      }
    }
  }
}
```

## Development

```bash
git clone git@github.com:drfarr/coolify-mcp.git
cd coolify-mcp
npm install
npm run dev
```

## License

MIT
