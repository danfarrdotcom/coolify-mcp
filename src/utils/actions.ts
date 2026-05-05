/**
 * HATEOAS-style _actions builder for responses.
 */

interface Action {
  tool: string;
  args: Record<string, unknown>;
  hint: string;
}

export function appActions(uuid: string): Action[] {
  return [
    { tool: "application_logs", args: { uuid }, hint: "View logs" },
    { tool: "restart_application", args: { uuid }, hint: "Restart" },
    { tool: "get_application", args: { uuid }, hint: "Full details" },
    { tool: "list_env_vars", args: { uuid }, hint: "View env vars" },
    { tool: "list_deployments_for_app", args: { uuid }, hint: "Deployment history" },
  ];
}

export function serverActions(uuid: string): Action[] {
  return [
    { tool: "server_resources", args: { uuid }, hint: "View resources" },
    { tool: "server_domains", args: { uuid }, hint: "View domains" },
    { tool: "validate_server", args: { uuid }, hint: "Validate connection" },
  ];
}

export function dbActions(uuid: string): Action[] {
  return [
    { tool: "restart_database", args: { uuid }, hint: "Restart" },
    { tool: "get_database", args: { uuid }, hint: "Full details" },
    { tool: "list_database_backups", args: { uuid }, hint: "View backups" },
  ];
}

export function serviceActions(uuid: string): Action[] {
  return [
    { tool: "restart_service", args: { uuid }, hint: "Restart" },
    { tool: "get_service", args: { uuid }, hint: "Full details" },
  ];
}

export function withActions(data: unknown, actions: Action[]) {
  return { data, _actions: actions };
}
