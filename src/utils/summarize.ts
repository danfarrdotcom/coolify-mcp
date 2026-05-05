/**
 * Token-optimized response summarization.
 * List endpoints return minimal summaries; get endpoints return full details.
 */

type SummaryFields = Record<string, string[]>;

const SUMMARY_FIELDS: SummaryFields = {
  application: ["uuid", "name", "fqdn", "status", "git_repository", "git_branch", "created_at"],
  server: ["uuid", "name", "ip", "user", "port", "is_reachable", "is_usable"],
  project: ["uuid", "name", "description"],
  database: ["uuid", "name", "type", "status", "image", "is_public", "public_port"],
  service: ["uuid", "name", "status", "fqdn", "created_at"],
  deployment: ["uuid", "deployment_uuid", "status", "commit", "created_at", "application_name", "server_name"],
  environment: ["uuid", "name", "project_id", "created_at"],
};

export function summarize(data: unknown, type: keyof typeof SUMMARY_FIELDS): unknown {
  const fields = SUMMARY_FIELDS[type];
  if (!fields) return data;

  if (Array.isArray(data)) {
    return data.map((item) => pick(item, fields));
  }
  return data; // Single items get full details
}

function pick(obj: unknown, fields: string[]): Record<string, unknown> {
  if (typeof obj !== "object" || obj === null) return {};
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in (obj as Record<string, unknown>)) {
      result[field] = (obj as Record<string, unknown>)[field];
    }
  }
  return result;
}

export type ResourceType = keyof typeof SUMMARY_FIELDS;
