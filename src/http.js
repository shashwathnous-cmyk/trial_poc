import http from "node:http";
import { createState } from "./state.js";
import {
  HttpError,
  addQuoteLine,
  applyDiscount,
  authorize,
  createQuote,
  currentUser,
  getDocumentation,
  getHealth,
  getLoadBalancer,
  getMetrics,
  getQuote,
  getRedundancy,
  listDiscountLogs,
  listProducts,
  listQuarterlyTests,
  listSecurityEvents,
  login,
  logout,
  ownQuote,
  releaseConnection,
  reportHealth,
  routeTraffic,
  runQuarterlyTest,
  saveDocumentation,
  saveLoadBalancer,
  saveRedundancy,
  submitQuote,
  testFailover,
  verifyIntegrity
} from "./domain.js";
import { pageFor, stylesheet } from "./views.js";

const ADMIN = ["system-administrator"];
const SALES = ["sales-representative"];

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": typeof body === "string" ? "text/html; charset=utf-8" : "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...headers
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new HttpError(413, "The request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new HttpError(400, "Send a JSON request body."));
      }
    });
    req.on("error", () => reject(new HttpError(400, "The request could not be read.")));
  });
}

function sessionId(req) {
  const header = req.headers.cookie ?? "";
  const match = header.match(/(?:^|;\s*)sid=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function cookie(sid) {
  return `sid=${encodeURIComponent(sid)}; HttpOnly; SameSite=Lax; Path=/`;
}

async function handle(state, req, res) {
  const url = new URL(req.url, "http://127.0.0.1");
  const path = url.pathname;
  const method = req.method;
  const sid = sessionId(req);

  if (method === "GET" && path === "/styles.css") {
    send(res, 200, stylesheet(), { "content-type": "text/css; charset=utf-8" });
    return;
  }

  if (method === "POST" && path === "/api/session") {
    const result = login(state, await readBody(req));
    send(res, 200, { user: result.user }, { "set-cookie": cookie(result.sid) });
    return;
  }
  if (method === "DELETE" && path === "/api/session") {
    logout(state, sid);
    send(res, 204, "", { "set-cookie": "sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
    return;
  }
  if (method === "GET" && path === "/api/me") {
    send(res, 200, { user: currentUser(state, sid) });
    return;
  }

  if (method === "GET" && path === "/api/loadbalancer/config") {
    authorize(state, sid, ADMIN);
    send(res, 200, getLoadBalancer(state));
    return;
  }
  if (method === "PUT" && path === "/api/loadbalancer/config") {
    const actor = authorize(state, sid, ADMIN);
    send(res, 200, saveLoadBalancer(state, actor, await readBody(req)));
    return;
  }
  if (method === "GET" && path === "/api/loadbalancer/metrics") {
    authorize(state, sid, ADMIN);
    send(res, 200, getMetrics(state));
    return;
  }
  if (method === "POST" && path === "/api/loadbalancer/route") {
    authorize(state, sid, ADMIN);
    send(res, 200, routeTraffic(state, await readBody(req)));
    return;
  }
  if (method === "POST" && path === "/api/loadbalancer/release") {
    authorize(state, sid, ADMIN);
    send(res, 200, releaseConnection(state, await readBody(req)));
    return;
  }

  if (method === "GET" && path === "/api/redundancy/config") {
    authorize(state, sid, ADMIN);
    send(res, 200, getRedundancy(state));
    return;
  }
  if (method === "PUT" && path === "/api/redundancy/config") {
    const actor = authorize(state, sid, ADMIN);
    send(res, 200, saveRedundancy(state, actor, await readBody(req)));
    return;
  }
  if (method === "GET" && path === "/api/redundancy/health") {
    authorize(state, sid, ADMIN);
    send(res, 200, getHealth(state));
    return;
  }
  if (method === "POST" && path === "/api/redundancy/health") {
    authorize(state, sid, ADMIN);
    send(res, 200, reportHealth(state, await readBody(req)));
    return;
  }
  if (method === "POST" && path === "/api/redundancy/test-failover") {
    authorize(state, sid, ADMIN);
    send(res, 200, testFailover(state));
    return;
  }
  if (method === "GET" && path === "/api/redundancy/integrity") {
    authorize(state, sid, ADMIN);
    send(res, 200, verifyIntegrity(state));
    return;
  }
  if (method === "GET" && path === "/api/redundancy/documentation") {
    authorize(state, sid, ADMIN);
    send(res, 200, getDocumentation(state));
    return;
  }
  if (method === "PUT" && path === "/api/redundancy/documentation") {
    const actor = authorize(state, sid, ADMIN);
    send(res, 200, saveDocumentation(state, actor, await readBody(req)));
    return;
  }
  if (method === "GET" && path === "/api/redundancy/quarterly-tests") {
    authorize(state, sid, ADMIN);
    send(res, 200, listQuarterlyTests(state));
    return;
  }
  if (method === "POST" && path === "/api/redundancy/quarterly-tests") {
    const actor = authorize(state, sid, ADMIN);
    send(res, 200, runQuarterlyTest(state, actor));
    return;
  }
  if (method === "GET" && path === "/api/security-events") {
    authorize(state, sid, ADMIN);
    send(res, 200, listSecurityEvents(state));
    return;
  }

  if (method === "GET" && path === "/api/products") {
    authorize(state, sid, SALES);
    send(res, 200, listProducts(state));
    return;
  }
  if (method === "GET" && path === "/api/quotes/mine") {
    const actor = authorize(state, sid, SALES);
    send(res, 200, ownQuote(state, actor));
    return;
  }
  if (method === "POST" && path === "/api/quotes") {
    const actor = authorize(state, sid, SALES);
    send(res, 201, createQuote(state, actor));
    return;
  }
  const lineMatch = path.match(/^\/api\/quotes\/([^/]+)\/lines$/);
  if (method === "POST" && lineMatch) {
    const actor = authorize(state, sid, SALES);
    send(res, 200, addQuoteLine(state, actor, decodeURIComponent(lineMatch[1]), await readBody(req)));
    return;
  }
  const submitMatch = path.match(/^\/api\/quotes\/([^/]+)\/submit$/);
  if (method === "POST" && submitMatch) {
    const actor = authorize(state, sid, SALES);
    send(res, 200, submitQuote(state, actor, decodeURIComponent(submitMatch[1])));
    return;
  }
  const quoteMatch = path.match(/^\/api\/quotes\/([^/]+)$/);
  if (method === "GET" && quoteMatch) {
    const actor = authorize(state, sid, SALES);
    send(res, 200, getQuote(state, actor, decodeURIComponent(quoteMatch[1])));
    return;
  }
  if (method === "POST" && path === "/api/quotes/apply-discount") {
    const actor = authorize(state, sid, SALES);
    send(res, 200, applyDiscount(state, actor, await readBody(req)));
    return;
  }
  if (method === "GET" && path === "/api/discount-logs") {
    const actor = authorize(state, sid, [...ADMIN, ...SALES]);
    send(res, 200, listDiscountLogs(state, actor));
    return;
  }

  if (method === "GET") {
    const html = pageFor(path, currentUser(state, sid));
    if (html) {
      send(res, html.status, html.body);
      return;
    }
  }

  send(res, 404, { error: "That page or API was not found." });
}

export function createServer(state = createState()) {
  const server = http.createServer((req, res) => {
    handle(state, req, res).catch((error) => {
      const status = error instanceof HttpError ? error.status : 500;
      const message = error instanceof HttpError ? error.message : "Unexpected server error.";
      if (res.headersSent) return;
      send(res, status, { error: message });
    });
  });
  return server;
}
