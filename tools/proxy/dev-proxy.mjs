// Single-origin dev reverse proxy.
//
// Routes one local URL to the three dev servers so the browser only ever talks
// to one origin (no CORS, host-only cookies, same-origin redirects):
//   /api  -> Express API
//   /app  -> Vite dashboard
//   /     -> Next.js public app
//
// Override any target or the listen port via env vars.

import http from "node:http";
import httpProxy from "http-proxy";

const PROXY_PORT = Number(process.env.PROXY_PORT ?? 8080);

const TARGETS = {
  api: process.env.API_URL ?? "http://localhost:5001",
  dashboard: process.env.DASHBOARD_URL ?? "http://localhost:5173",
  public: process.env.PUBLIC_URL ?? "http://localhost:3000",
};

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
  xfwd: true,
});

proxy.on("error", (err, _req, res) => {
  if (res && "writeHead" in res && !res.headersSent) {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`[dev-proxy] upstream error: ${err.message}`);
  } else if (res && "destroy" in res) {
    res.destroy(err);
  }
});

function resolveTarget(url = "/") {
  if (url === "/api" || url.startsWith("/api/")) return TARGETS.api;
  if (url === "/app" || url.startsWith("/app/")) return TARGETS.dashboard;
  return TARGETS.public;
}

const server = http.createServer((req, res) => {
  // The dashboard is served under a `/app/` base; redirect the bare `/app`
  // to `/app/` so it doesn't hit Vite's base-mismatch hint page.
  if (req.url === "/app") {
    res.writeHead(302, { location: "/app/" });
    res.end();
    return;
  }
  proxy.web(req, res, { target: resolveTarget(req.url) });
});

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head, { target: resolveTarget(req.url) });
});

server.listen(PROXY_PORT, () => {
  console.log(`[dev-proxy] listening on http://localhost:${PROXY_PORT}`);
  console.log(`[dev-proxy]   /     -> ${TARGETS.public}    (Next public app)`);
  console.log(`[dev-proxy]   /app  -> ${TARGETS.dashboard} (Vite dashboard)`);
  console.log(`[dev-proxy]   /api  -> ${TARGETS.api}    (Express API)`);
});
