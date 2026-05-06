import type { Metadata } from "next";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata: Metadata = {
  title: "Coolify MCP Docs",
  description: "Documentation for the Coolify MCP server.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const banner = (
    <Banner storageKey="coolify-mcp-docs-banner">
      Coolify MCP docs are live.
    </Banner>
  );

  const navbar = <Navbar logo={<b>Coolify MCP</b>} />;
  const footer = <Footer>MIT {new Date().getFullYear()} © Dan Farr.</Footer>;

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/drfarr/coolify-mcp/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
