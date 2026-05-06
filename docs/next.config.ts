import path from "path";
import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Avoid native lightningcss binary loading issues in certain macOS environments.
  experimental: {
    useLightningcss: false,
  },
  outputFileTracingRoot: path.join(__dirname, "../"),
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./src/mdx-components.tsx",
    },
  },
});
