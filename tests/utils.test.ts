import { describe, it, expect } from "vitest";
import { summarize } from "../src/utils/summarize.js";
import { withActions, appActions, serverActions } from "../src/utils/actions.js";
import { maskSecrets } from "../src/client/index.js";

describe("summarize", () => {
  it("picks only summary fields for applications", () => {
    const apps = [
      { uuid: "abc", name: "my-app", fqdn: "https://app.com", status: "running", git_repository: "org/repo", git_branch: "main", created_at: "2025-01-01", docker_compose: "huge blob", server: { nested: "object" } },
    ];
    const result = summarize(apps, "application") as Array<Record<string, unknown>>;
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ uuid: "abc", name: "my-app", fqdn: "https://app.com", status: "running", git_repository: "org/repo", git_branch: "main", created_at: "2025-01-01" });
    expect(result[0]).not.toHaveProperty("docker_compose");
    expect(result[0]).not.toHaveProperty("server");
  });

  it("picks only summary fields for servers", () => {
    const servers = [{ uuid: "s1", name: "prod", ip: "1.2.3.4", user: "root", port: 22, is_reachable: true, is_usable: true, extra: "stuff" }];
    const result = summarize(servers, "server") as Array<Record<string, unknown>>;
    expect(result[0]).not.toHaveProperty("extra");
    expect(result[0].ip).toBe("1.2.3.4");
  });

  it("returns single items unchanged", () => {
    const app = { uuid: "abc", name: "my-app", all_the_fields: true };
    expect(summarize(app, "application")).toBe(app);
  });

  it("handles empty arrays", () => {
    expect(summarize([], "application")).toEqual([]);
  });
});

describe("maskSecrets", () => {
  it("masks value fields", () => {
    const envs = [{ key: "DB_URL", value: "postgres://secret", uuid: "e1" }];
    const result = maskSecrets(envs) as Array<Record<string, unknown>>;
    expect(result[0].value).toBe("********");
    expect(result[0].key).toBe("DB_URL");
  });

  it("masks nested secrets", () => {
    const obj = { data: { password: "hunter2", name: "ok" } };
    const result = maskSecrets(obj) as Record<string, Record<string, unknown>>;
    expect(result.data.password).toBe("********");
    expect(result.data.name).toBe("ok");
  });

  it("masks real_value and token", () => {
    const env = { real_value: "secret", token: "abc123", key: "API_KEY" };
    const result = maskSecrets(env) as Record<string, unknown>;
    expect(result.real_value).toBe("********");
    expect(result.token).toBe("********");
    expect(result.key).toBe("API_KEY");
  });

  it("handles null and primitives", () => {
    expect(maskSecrets(null)).toBe(null);
    expect(maskSecrets("hello")).toBe("hello");
    expect(maskSecrets(42)).toBe(42);
  });
});

describe("actions", () => {
  it("builds app actions with uuid", () => {
    const actions = appActions("abc123");
    expect(actions).toHaveLength(5);
    expect(actions[0]).toEqual({ tool: "application_logs", args: { uuid: "abc123" }, hint: "View logs" });
  });

  it("builds server actions", () => {
    const actions = serverActions("s1");
    expect(actions).toHaveLength(3);
    expect(actions[0].tool).toBe("server_resources");
  });

  it("withActions wraps data", () => {
    const result = withActions({ name: "test" }, [{ tool: "foo", args: {}, hint: "bar" }]);
    expect(result.data).toEqual({ name: "test" });
    expect(result._actions).toHaveLength(1);
  });
});
