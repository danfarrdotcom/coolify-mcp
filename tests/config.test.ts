import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config/index.js";

describe("loadConfig", () => {
  it("loads single instance from env", () => {
    process.env.COOLIFY_ACCESS_TOKEN = "test-token";
    process.env.COOLIFY_BASE_URL = "https://coolify.test.com";
    delete process.env.COOLIFY_INSTANCES;

    const config = loadConfig();
    expect(config.instances).toHaveLength(1);
    expect(config.instances[0].name).toBe("default");
    expect(config.instances[0].baseUrl).toBe("https://coolify.test.com");
    expect(config.instances[0].token).toBe("test-token");
    expect(config.defaultInstance).toBe("default");
  });

  it("loads multi-instance from env", () => {
    delete process.env.COOLIFY_ACCESS_TOKEN;
    delete process.env.COOLIFY_BASE_URL;
    process.env.COOLIFY_INSTANCES = "prod=https://prod.coolify.io|token1,staging=https://staging.coolify.io|token2";

    const config = loadConfig();
    expect(config.instances).toHaveLength(2);
    expect(config.instances[0].name).toBe("prod");
    expect(config.instances[1].name).toBe("staging");
    expect(config.defaultInstance).toBe("prod");
  });

  it("throws without any token", () => {
    delete process.env.COOLIFY_ACCESS_TOKEN;
    delete process.env.COOLIFY_INSTANCES;

    expect(() => loadConfig()).toThrow("COOLIFY_ACCESS_TOKEN or COOLIFY_INSTANCES must be set");
  });
});
