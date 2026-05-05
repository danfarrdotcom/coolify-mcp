# @drfarr/coolify-mcp

A better MCP server for [Coolify](https://coolify.io) — the open-source self-hosted PaaS.

## What's different

- **Multi-instance** — manage staging + production Coolify from one MCP server
- **Token-optimized** — list endpoints return summaries (90%+ smaller), get endpoints return full details
- **Smart lookup** — find apps by name/domain, servers by name/IP — not just UUIDs
- **Diagnostics** — `diagnose_app`, `diagnose_server`, `find_issues` aggregate multiple API calls
- **HATEOAS responses** — `_actions` suggest logical next steps to AI assistants
- **MCP Resources** — subscribe to infrastructure state per instance
- **MCP Prompts** — pre-built workflows: deploy, debug, rollback, env-diff, migrate, provision
- **Secret masking** — env var values never leak in responses
- **Full API coverage** — servers, projects, apps, databases, services, deployments, backups, keys, teams
- **OpenAPI-generated types** — auto-synced with Coolify releases

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

## Token-Optimized Responses

List endpoints return minimal summaries (uuid, name, status). Get endpoints return full details. This prevents context window exhaustion — responses are 90-99% smaller than raw API output.

Responses include `_actions` suggesting next steps:

```json
{
  "data": { "uuid": "abc123", "name": "my-app", "status": "running" },
  "_actions": [
    { "tool": "application_logs", "args": { "uuid": "abc123" }, "hint": "View logs" },
    { "tool": "restart_application", "args": { "uuid": "abc123" }, "hint": "Restart" }
  ]
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
