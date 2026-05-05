import type { CoolifyInstance } from "../config/index.js";

const MASKED = "********";

export class CoolifyClient {
  constructor(private instance: CoolifyInstance) {}

  get name() {
    return this.instance.name;
  }

  async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.instance.baseUrl}/api/v1${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.instance.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new CoolifyApiError(res.status, body, path);
    }

    const text = await res.text();
    if (!text) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export class CoolifyApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public path: string,
  ) {
    super(`Coolify API error ${status} on ${path}: ${body}`);
  }
}

export function maskSecrets(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(maskSecrets);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (/^(value|real_value|secret|token|password|private_key)$/i.test(key) && typeof value === "string") {
      result[key] = MASKED;
    } else {
      result[key] = maskSecrets(value);
    }
  }
  return result;
}
