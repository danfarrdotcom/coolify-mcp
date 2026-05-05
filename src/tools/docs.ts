import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const DOCS_BASE = "https://coolify.io/docs";
const DOCS_INDEX_URL = "https://raw.githubusercontent.com/coollabsio/coolify.io/main/docs.json";

interface DocChunk {
  title: string;
  url: string;
  content: string;
}

let docsCache: DocChunk[] | null = null;

async function loadDocs(): Promise<DocChunk[]> {
  if (docsCache) return docsCache;

  try {
    const res = await fetch(DOCS_INDEX_URL);
    if (res.ok) {
      docsCache = (await res.json()) as DocChunk[];
      return docsCache;
    }
  } catch {}

  // Fallback: hardcoded common topics
  docsCache = [
    { title: "Getting Started", url: `${DOCS_BASE}/getting-started`, content: "Install Coolify, configure server, first deployment. Docker required. Supports Traefik and Caddy as reverse proxies." },
    { title: "Environment Variables", url: `${DOCS_BASE}/knowledge-base/environment-variables`, content: "Set environment variables for applications. Support build-time and runtime vars. Preview deployment vars. Bulk update via API." },
    { title: "Health Checks", url: `${DOCS_BASE}/knowledge-base/health-checks`, content: "Configure health check path, interval, timeout, retries, start period. Custom health check commands for Docker." },
    { title: "Domains", url: `${DOCS_BASE}/knowledge-base/domains`, content: "Configure custom domains, wildcard domains, SSL certificates via Let's Encrypt. Traefik and Caddy configuration." },
    { title: "Docker Compose", url: `${DOCS_BASE}/knowledge-base/docker-compose`, content: "Deploy docker-compose applications. Custom start/build commands. Multi-service deployments. Volume mounts." },
    { title: "Databases", url: `${DOCS_BASE}/databases`, content: "PostgreSQL, MySQL, MariaDB, MongoDB, Redis, KeyDB, ClickHouse, DragonFly. Automated backups, S3 storage, public access." },
    { title: "Backups", url: `${DOCS_BASE}/knowledge-base/backups`, content: "Scheduled database backups. Cron frequency. S3 storage. Retention policies. Backup execution history." },
    { title: "Build Packs", url: `${DOCS_BASE}/knowledge-base/build-packs`, content: "Nixpacks (auto-detect), Static, Dockerfile, Docker Compose. Each has different configuration options." },
    { title: "Servers", url: `${DOCS_BASE}/servers`, content: "Add servers via SSH. Private key authentication. Proxy configuration (Traefik/Caddy/None). Build servers. Validation." },
    { title: "API", url: `${DOCS_BASE}/api`, content: "REST API with Bearer token auth. Generate tokens in Settings. All resources accessible via /api/v1/." },
    { title: "Troubleshooting", url: `${DOCS_BASE}/knowledge-base/troubleshooting`, content: "502 Bad Gateway: check container health, port mapping, proxy config. Container not starting: check logs, env vars, Dockerfile. DNS issues: verify domain pointing to server IP." },
    { title: "Persistent Storage", url: `${DOCS_BASE}/knowledge-base/persistent-storage`, content: "Mount volumes to containers. Host path mounts. Named volumes. File mounts for config files." },
    { title: "Preview Deployments", url: `${DOCS_BASE}/knowledge-base/preview-deployments`, content: "Deploy pull requests automatically. Separate env vars for previews. Auto-generated domains with PR suffix." },
    { title: "Scheduled Tasks", url: `${DOCS_BASE}/knowledge-base/scheduled-tasks`, content: "Run commands on a cron schedule inside containers. Configure timeout, enable/disable without deletion." },
    { title: "GitHub Apps", url: `${DOCS_BASE}/knowledge-base/github-apps`, content: "Connect private repositories via GitHub App. Installation ID, client credentials, webhook configuration." },
  ];
  return docsCache;
}

export function registerDocsTools(server: McpServer) {
  server.tool(
    "search_docs",
    "Search Coolify documentation. Returns relevant docs with titles, URLs, and content snippets.",
    { query: z.string().describe("Search query (e.g. 'health check', 'backup s3', '502 error')") },
    async ({ query }) => {
      const docs = await loadDocs();
      const terms = query.toLowerCase().split(/\s+/);

      const scored = docs
        .map((doc) => {
          const text = `${doc.title} ${doc.content}`.toLowerCase();
          const score = terms.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0);
          return { ...doc, score };
        })
        .filter((d) => d.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (scored.length === 0) {
        return { content: [{ type: "text", text: `No docs found for "${query}". Try broader terms or check ${DOCS_BASE}` }] };
      }

      const results = scored.map((d) => ({ title: d.title, url: d.url, snippet: d.content.slice(0, 200) }));
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    },
  );
}
