import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
const exportDirectory = path.join(projectDirectory, "out");
const wranglerPath = path.join(
  projectDirectory,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler",
);
const expectedSecurityHeaders = {
  "content-security-policy":
    "default-src 'self'; base-uri 'none'; connect-src 'self'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  "permissions-policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

const servers = [];
let httpServer;
let httpsServer;
let wwwServer;

function request(server, pathname, options = {}) {
  const transport = server.protocol === "https" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(
      {
        headers: { host: options.host ?? "storecanary.app" },
        hostname: "127.0.0.1",
        method: options.method ?? "GET",
        path: pathname,
        port: server.port,
        rejectUnauthorized: false,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({
            body: Buffer.concat(chunks).toString("utf8"),
            headers: response.headers,
            status: response.statusCode,
          });
        });
      },
    );

    request.on("error", reject);
    request.end();
  });
}

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert(address && typeof address === "object");
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function startWrangler(protocol, localUpstream) {
  const port = await availablePort();
  const arguments_ = [
    "dev",
    "--local",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    "--local-protocol",
    protocol,
    "--log-level",
    "error",
    "--show-interactive-dev-session=false",
  ];
  if (localUpstream) {
    arguments_.push("--local-upstream", localUpstream);
  }

  const child = spawn(wranglerPath, arguments_, {
    cwd: projectDirectory,
    env: {
      ...process.env,
      CI: "true",
      WRANGLER_SEND_METRICS: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const server = { child, output: "", port, protocol };
  servers.push(server);
  child.stdout.on("data", (chunk) => {
    server.output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    server.output += chunk;
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`wrangler dev exited with code ${child.exitCode}\n${server.output}`);
    }

    try {
      await request(server, "/__wrangler_ready__");
      return server;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`wrangler dev did not become ready\n${server.output}`);
}

async function stopWrangler(server) {
  if (server.child.exitCode !== null) {
    return;
  }

  const closed = new Promise((resolve) => server.child.once("close", resolve));
  server.child.kill("SIGTERM");
  await closed;
}

function expectSecurityHeaders(response) {
  for (const [name, value] of Object.entries(expectedSecurityHeaders)) {
    assert.equal(response.headers[name], value, name);
  }
}

async function findStaticAsset(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedAsset = await findStaticAsset(absolutePath, relativePath);
      if (nestedAsset) {
        return nestedAsset;
      }
    } else if (relativePath.startsWith("_next/static/")) {
      return `/${relativePath}`;
    }
  }
}

before(async () => {
  httpServer = await startWrangler("http");
  httpsServer = await startWrangler("https");
  wwwServer = await startWrangler("https", "www.storecanary.app");
});

after(async () => {
  await Promise.all(servers.map(stopWrangler));
});

test("local Wrangler applies canonical redirects without contacting Cloudflare", async () => {
  const httpRedirect = await request(httpServer, "/daily?source=local-check");
  assert.equal(httpRedirect.status, 308);
  // Wrangler rewrites absolute redirects to the local listener's protocol in dev mode.
  // Unit coverage checks the production https scheme; this integration verifies that
  // an HTTP request still takes the redirect branch and canonicalizes the target.
  assert.equal(httpRedirect.headers.location, "http://storecanary.app/daily?source=local-check");
  expectSecurityHeaders(httpRedirect);

  const wwwRedirect = await request(wwwServer, "/daily?source=local-check");
  assert.equal(wwwRedirect.status, 308);
  assert.equal(wwwRedirect.headers.location, "https://storecanary.app/daily?source=local-check");
  expectSecurityHeaders(wwwRedirect);
});

test("local Wrangler serves the exported landing page through the Worker wrapper", async () => {
  const response = await request(httpsServer, "/");

  assert.equal(response.status, 200);
  assert.match(response.headers["content-type"], /^text\/html/);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.match(response.body, /Store Canary · WooCommerce Daily Ops/);
  expectSecurityHeaders(response);
});

test("local Wrangler applies the immutable cache policy to a built static asset", async () => {
  const assetPath = await findStaticAsset(exportDirectory);
  assert(assetPath, "the Next.js export must contain a _next/static asset");

  const response = await request(httpsServer, assetPath);
  assert.equal(response.status, 200);
  assert.equal(response.headers["cache-control"], "public, max-age=31536000, immutable");
  expectSecurityHeaders(response);
});

test("local Wrangler rejects mutating methods before redirects or asset routing", async () => {
  const response = await request(httpServer, "/", {
    host: "www.storecanary.app",
    method: "POST",
  });

  assert.equal(response.status, 405);
  assert.equal(response.headers.allow, "GET, HEAD");
  assert.equal(response.headers.location, undefined);
  assert.equal(response.body, "");
  expectSecurityHeaders(response);
});
