# coolify-mcp

[![npm version](https://img.shields.io/npm/v/%40danfarrdotcom%2Fcoolify-mcp.svg)](https://www.npmjs.com/package/@danfarrdotcom/coolify-mcp)
[![npm downloads](https://img.shields.io/npm/dm/%40danfarrdotcom%2Fcoolify-mcp.svg)](https://www.npmjs.com/package/@danfarrdotcom/coolify-mcp)
[![GitHub release](https://img.shields.io/github/v/release/danfarrdotcom/coolify-mcp?label=release)](https://github.com/danfarrdotcom/coolify-mcp/releases)
[![License](https://img.shields.io/npm/l/%40danfarrdotcom%2Fcoolify-mcp.svg)](https://github.com/danfarrdotcom/coolify-mcp/blob/main/LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-1.0.0-green.svg)](https://modelcontextprotocol.io)

**The most complete MCP server for [Coolify](https://coolify.io) — giving AI assistants full control over your self-hosted infrastructure.**

## Why coolify-mcp?

Managing self-hosted infrastructure through AI requires **context-aware tools** that understand how you actually work:

- **Stop wasting tokens on verbose API responses** — Coolify's API returns 90+ fields per resource. Our token-optimized design reduces response sizes by 90-99%, keeping your AI's context window free for what matters.
- **Work across environments seamlessly** — manage staging + production from one session, compare apps, clone environment variables between instances.
- **AI-native workflows** — not just API wrappers. Diagnostic tools aggregate multiple calls, `_actions` suggest logical next steps, and smart lookup finds resources by name or domain (not just UUIDs).
- **75+ tools, zero gaps** — complete Coolify v4 API coverage including Hetzner provisioning, scheduled tasks, batch operations, and team management.

## What's different

- **Multi-instance** — manage staging + production Coolify from one MCP server
- **Token-optimized** — list endpoints return summaries (90%+ smaller), get endpoints return full details
- **Smart lookup** — find apps by name/domain, servers by name/IP — not just UUIDs
- **Diagnostics** — `diagnose_app`, `diagnose_server`, `find_issues` aggregate multiple API calls
- **HATEOAS responses** — `_actions` suggest logical next steps to AI assistants
- **Cross-instance** — compare apps, clone env vars between staging and production
- **Batch operations** — restart projects, bulk update env vars, emergency stop all
- **MCP Resources** — subscribe to infrastructure state per instance
- **MCP Prompts** — pre-built workflows: deploy, debug, rollback, env-diff, migrate, provision
- **Secret masking** — env var values never leak in responses
- **Full API coverage** — 75+ tools across servers, projects, apps, databases, services, deployments, backups, keys, teams, cloud providers
- **OpenAPI-generated types** — auto-synced with Coolify releases

## Installation

### Prerequisites

- Node.js >= 20
- A running Coolify instance (v4.x)
- Coolify API access token (Settings → API → Generate Token)

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "@danfarrdotcom/coolify-mcp"],
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
      "args": ["-y", "@danfarrdotcom/coolify-mcp"],
      "env": {
        "COOLIFY_INSTANCES": "prod=https://coolify.example.com|token1,staging=https://staging.coolify.example.com|token2"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add coolify \
  -e COOLIFY_BASE_URL="https://your-coolify.com" \
  -e COOLIFY_ACCESS_TOKEN="your-token" \
  -- npx @danfarrdotcom/coolify-mcp@latest
```

### Cursor / Windsurf

```bash
env COOLIFY_ACCESS_TOKEN=your-token COOLIFY_BASE_URL=https://your-coolify.com npx -y @danfarrdotcom/coolify-mcp
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `COOLIFY_ACCESS_TOKEN` | Yes (single) | — | Your Coolify API token |
| `COOLIFY_BASE_URL` | No | `http://localhost:3000` | Your Coolify instance URL |
| `COOLIFY_INSTANCES` | Yes (multi) | — | Comma-separated `name=url\|token` pairs |

## Tools (75+)

| Category | Tools |
|----------|-------|
| **Infrastructure** | `list_instances`, `get_version`, `get_infrastructure_overview` |
| **Diagnostics** | `diagnose_app`, `diagnose_server`, `find_issues` |
| **Batch Ops** | `restart_project_apps`, `stop_all_apps`, `redeploy_project`, `bulk_env_update_across_apps` |
| **Cross-Instance** | `compare_apps`, `clone_env_vars` |
| **Servers** | `list_servers`, `get_server`, `create_server`, `update_server`, `delete_server`, `server_resources`, `server_domains`, `validate_server` |
| **Projects** | `list_projects`, `get_project`, `create_project`, `update_project`, `delete_project` |
| **Environments** | `list_environments`, `get_environment`, `create_environment`, `delete_environment` |
| **Applications** | `list_applications`, `get_application`, `create_application_public`, `create_application_docker_image`, `create_application_dockerfile`, `create_application_private_github`, `create_application_private_key`, `update_application`, `delete_application`, `application_logs`, `start_application`, `stop_application`, `restart_application` |
| **Env Vars** | `list_env_vars`, `create_env_var`, `update_env_var`, `bulk_update_env_vars`, `delete_env_var` |
| **Databases** | `list_databases`, `get_database`, `create_database`, `update_database`, `delete_database`, `start_database`, `stop_database`, `restart_database` |
| **Backups** | `list_database_backups`, `create_database_backup`, `delete_database_backup`, `list_backup_executions` |
| **Services** | `list_services`, `get_service`, `create_service`, `update_service`, `delete_service`, `start_service`, `stop_service`, `restart_service` |
| **Deployments** | `list_deployments`, `get_deployment`, `list_deployments_for_app`, `deploy`, `cancel_deployment` |
| **Scheduled Tasks** | `list_scheduled_tasks`, `create_scheduled_task`, `update_scheduled_task`, `delete_scheduled_task`, `list_scheduled_task_executions` |
| **Storages** | `list_storages`, `create_storage`, `delete_storage` |
| **GitHub Apps** | `list_github_apps`, `list_github_repos`, `list_github_branches`, `delete_github_app` |
| **Cloud Providers** | `list_cloud_tokens`, `create_cloud_token`, `validate_cloud_token`, `delete_cloud_token`, `hetzner_locations`, `hetzner_server_types`, `hetzner_images`, `create_hetzner_server` |
| **Private Keys** | `list_private_keys`, `get_private_key`, `create_private_key`, `delete_private_key` |
| **Teams** | `list_teams`, `get_team`, `get_team_members`, `get_current_team`, `get_current_team_members` |

## MCP Resources

| URI | Description |
|-----|-------------|
| `coolify://infrastructure` | Full overview across all instances |
| `coolify://{instance}/servers` | Servers on a specific instance |
| `coolify://{instance}/applications` | Applications on a specific instance |
| `coolify://{instance}/databases` | Databases on a specific instance |
| `coolify://{instance}/services` | Services on a specific instance |

## MCP Prompts

| Prompt | Description |
|--------|-------------|
| `deploy-app` | Step-by-step deployment workflow |
| `debug-app` | Diagnose a failing application |
| `env-diff` | Compare env vars between two apps |
| `rollback` | Rollback to a previous deployment |
| `migrate-app` | Migrate app between instances |
| `provision-server` | Set up a new server from scratch |

## Architecture

### Token-Optimized Responses

The Coolify API returns extremely verbose responses — a single application can contain 90+ fields. When listing 20+ applications, responses can exceed 200KB, quickly exhausting AI context windows.

This server solves this with a two-tier approach:

| Tool Type | Returns | Use Case |
|-----------|---------|----------|
| `list_*` | Summaries only (uuid, name, status) | Discovery, finding resources |
| `get_*` | Full details for a single resource | Deep inspection, debugging |
| `get_infrastructure_overview` | All resources summarized in one call | Start here |

**Response size reduction:**

| Endpoint | Raw API | This Server | Reduction |
|----------|---------|-------------|-----------|
| list_applications (20 apps) | ~170KB | ~4KB | **97%** |
| list_services | ~367KB | ~1.2KB | **99%** |
| list_deployments | ~1MB | ~4KB | **99.6%** |

### HATEOAS-style Actions

Every `get_*` response includes `_actions` suggesting logical next steps:

```json
{
  "data": { "uuid": "abc123", "name": "my-app", "status": "running" },
  "_actions": [
    { "tool": "application_logs", "args": { "uuid": "abc123" }, "hint": "View logs" },
    { "tool": "restart_application", "args": { "uuid": "abc123" }, "hint": "Restart" },
    { "tool": "list_env_vars", "args": { "uuid": "abc123" }, "hint": "View env vars" },
    { "tool": "list_deployments_for_app", "args": { "uuid": "abc123" }, "hint": "Deployment history" }
  ]
}
```

### Smart Lookup

Diagnostic and get tools accept human-friendly identifiers:

- **Applications**: UUID, name, or domain (e.g. `"my-app"`, `"example.com"`)
- **Servers**: UUID, name, or IP (e.g. `"prod-server"`, `"192.168.1.100"`)
- **Databases**: UUID or name
- **Services**: UUID or name

### Secret Masking

Environment variable values are automatically masked in responses. Keys like `value`, `real_value`, `secret`, `token`, `password`, and `private_key` are replaced with `********`.

### Multi-Instance

Every tool accepts an optional `instance` parameter. When omitted, the default (first configured) instance is used. Cross-instance tools like `compare_apps` and `clone_env_vars` take explicit source/target instance parameters.

## Usage Examples

### Getting Started

```
"Give me an overview of my infrastructure"
→ calls get_infrastructure_overview

"Show me all my applications"
→ calls list_applications

"What's running on my prod server?"
→ calls server_resources with smart lookup
```

### Debugging

```
"Diagnose my-app — it's returning 502s"
→ calls diagnose_app (aggregates status, logs, deployments, env vars)

"Find any issues in my infrastructure"
→ calls find_issues (scans all resources for unhealthy state)

"Show me the last 200 lines of logs for my-api"
→ calls application_logs with lines=200
```

### Deployment

```
"Deploy my-app with a force rebuild"
→ calls deploy with force=true

"Cancel the current deployment"
→ calls cancel_deployment

"Redeploy everything in the web-project"
→ calls redeploy_project
```

### Environment Variables

```
"Compare env vars between staging and production"
→ calls compare_apps across instances

"Copy all env vars from staging to production"
→ calls clone_env_vars

"Set DATABASE_URL across all my apps"
→ calls bulk_env_update_across_apps
```

### Server Provisioning

```
"Provision a new Hetzner server in Nuremberg"
→ calls hetzner_locations, hetzner_server_types, create_hetzner_server

"Validate my new server connection"
→ calls validate_server
```

### Batch Operations

```
"Restart all apps in the web project"
→ calls restart_project_apps

"Emergency stop everything"
→ calls stop_all_apps (requires confirm=true)
```

## Recommended Workflow

1. **Start with overview**: `get_infrastructure_overview` — see everything at once
2. **Find your target**: `list_applications` / `list_servers` — get UUIDs
3. **Dive deep**: `get_application(identifier)` — full details + suggested actions
4. **Take action**: Follow `_actions` suggestions or use batch tools

## Development

```bash
git clone git@github.com:drfarr/coolify-mcp.git
cd coolify-mcp
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode with tsx |
| `npm run build` | Compile TypeScript |
| `npm run typecheck` | Type-check without emitting |
| `npm run generate-types` | Regenerate types from Coolify OpenAPI spec |
| `npm test` | Run tests |

### Project Structure

```
src/
├── index.ts              # Entry point, server setup
├── config/index.ts       # Multi-instance configuration
├── client/index.ts       # HTTP client + secret masking
├── tools/
│   ├── index.ts          # Tool registration orchestrator
│   ├── infrastructure.ts # list_instances, get_version, overview
│   ├── servers.ts        # Server CRUD + validation
│   ├── projects.ts       # Projects + environments
│   ├── applications.ts   # App CRUD + env vars + lifecycle
│   ├── databases.ts      # Database CRUD + backups
│   ├── services.ts       # Service CRUD + lifecycle
│   ├── deployments.ts    # Deploy, cancel, history
│   ├── diagnostics.ts    # diagnose_app, diagnose_server, find_issues
│   ├── batch.ts          # Bulk operations
│   ├── cross-instance.ts # compare_apps, clone_env_vars
│   ├── scheduled-tasks.ts
│   ├── storages.ts
│   ├── github-apps.ts
│   ├── cloud-tokens.ts   # Hetzner/DO + provisioning
│   ├── private-keys.ts
│   └── teams.ts
├── resources/index.ts    # MCP resource subscriptions
├── prompts/index.ts      # MCP prompt workflows
└── utils/
    ├── summarize.ts      # Token-optimized response shaping
    ├── resolve.ts        # Smart lookup (name/domain/IP → UUID)
    └── actions.ts        # HATEOAS _actions builder
```

## Comparison with alternatives

| Feature | coolify-mcp | @masonator/coolify-mcp |
|---------|--------------------|-----------------------|
| Tools | 75+ | 38 |
| Multi-instance | ✅ | ❌ |
| Cross-instance ops | ✅ | ❌ |
| MCP Resources | ✅ | ❌ |
| MCP Prompts | ✅ | ❌ |
| Token optimization | ✅ | ✅ |
| Smart lookup | ✅ | ✅ |
| Diagnostics | ✅ | ✅ |
| HATEOAS actions | ✅ | ✅ |
| Batch operations | ✅ | ✅ |
| Secret masking | ✅ | ❌ |
| Hetzner provisioning | ✅ | ❌ |
| Scheduled tasks | ✅ | ❌ |
| Storage management | ✅ | ❌ |
| Database backups | ✅ | ❌ |
| Docs search | ❌ (planned) | ✅ |
| OpenAPI types | ✅ | ❌ |

## License

MIT
