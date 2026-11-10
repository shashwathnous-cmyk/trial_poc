import assert from "node:assert/strict";
import test from "node:test";
import { calculateDiscount } from "../src/domain.js";
import { createServer } from "../src/http.js";

async function withClient(run) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const clients = new Map();

  function client(name) {
    if (!clients.has(name)) clients.set(name, { cookie: "" });
    const jar = clients.get(name);
    return async function request(path, options = {}) {
      const headers = { ...(options.headers ?? {}) };
      if (jar.cookie) headers.cookie = jar.cookie;
      const response = await fetch(base + path, { ...options, headers });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        const sid = setCookie.match(/sid=([^;]*)/);
        jar.cookie = sid && sid[1] ? `sid=${sid[1]}` : "";
      }
      return response;
    };
  }

  async function signIn(name, username, password) {
    const request = client(name);
    const response = await request("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    assert.equal(response.status, 200);
    return request;
  }

  try {
    await run({ base, client, signIn });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function json(body, method = "POST") {
  return { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

test("discount cents round half up", () => {
  assert.deepEqual(calculateDiscount(258, 10), { subtotal: 258, discountAmount: 25.8, total: 232.2 });
  assert.deepEqual(calculateDiscount(21.75, 10), { subtotal: 21.75, discountAmount: 2.18, total: 19.57 });
});

test("load balancer save, even application routing, and excluded non-application traffic", async () => {
  await withClient(async ({ signIn }) => {
    const sales = await signIn("sam", "sam", "sam-pass");
    const denied = await sales("/api/loadbalancer/config", json({
      method: "round-robin",
      servers: [
        { id: "app-a", name: "App A", address: "10.0.0.1" },
        { id: "app-b", name: "App B", address: "10.0.0.2" }
      ]
    }, "PUT"));
    assert.equal(denied.status, 403);

    const admin = await signIn("admin", "admin", "admin-pass");
    const invalid = await admin("/api/loadbalancer/config", json({ method: "round-robin", servers: [{ id: "only", name: "Only", address: "10.0.0.9" }] }, "PUT"));
    assert.equal(invalid.status, 400);

    const saved = await admin("/api/loadbalancer/config", json({
      method: "round-robin",
      servers: [
        { id: "app-a", name: "App A", address: "10.0.0.1" },
        { id: "app-b", name: "App B", address: "10.0.0.2" }
      ]
    }, "PUT"));
    assert.equal(saved.status, 200);
    const savedBody = await saved.json();
    assert.equal(savedBody.applied, true);
    assert.equal(savedBody.config.method, "round-robin");

    for (let index = 0; index < 8; index += 1) {
      const routed = await admin("/api/loadbalancer/route", json({ trafficClass: "application" }));
      assert.equal(routed.status, 200);
      const body = await routed.json();
      assert.equal(body.routed, true);
      assert.ok(body.elapsedMs < 2000);
    }
    for (let index = 0; index < 5; index += 1) {
      const skipped = await admin("/api/loadbalancer/route", json({ trafficClass: "non-application" }));
      const body = await skipped.json();
      assert.equal(body.excluded, true);
      assert.equal(body.routed, false);
    }
    const metrics = await (await admin("/api/loadbalancer/metrics")).json();
    assert.equal(metrics.even, true);
    assert.deepEqual(metrics.servers.map((server) => server.requestCount), [4, 4]);

    const burst = await Promise.all(Array.from({ length: 100 }, () => admin("/api/loadbalancer/route", json({ trafficClass: "application" }))));
    const burstBodies = await Promise.all(burst.map((response) => response.json()));
    assert.ok(burstBodies.every((body) => body.elapsedMs < 2000));
    const after = await (await admin("/api/loadbalancer/metrics")).json();
    assert.equal(after.even, true);
    assert.ok(Math.max(...after.servers.map((server) => server.requestCount)) - Math.min(...after.servers.map((server) => server.requestCount)) <= 1);
  });
});

test("least connections keeps active load within one connection", async () => {
  await withClient(async ({ signIn }) => {
    const admin = await signIn("admin", "admin", "admin-pass");
    await admin("/api/loadbalancer/config", json({
      method: "least-connections",
      servers: [
        { id: "app-a", name: "App A", address: "10.0.0.1" },
        { id: "app-b", name: "App B", address: "10.0.0.2" }
      ]
    }, "PUT"));
    for (let index = 0; index < 5; index += 1) {
      const routed = await (await admin("/api/loadbalancer/route", json({ trafficClass: "application", hold: true }))).json();
      assert.ok(routed.elapsedMs < 2000);
    }
    const metrics = await (await admin("/api/loadbalancer/metrics")).json();
    const active = metrics.servers.map((server) => server.activeConnections);
    assert.equal(active.reduce((sum, value) => sum + value, 0), 5);
    assert.ok(Math.max(...active) - Math.min(...active) <= 1);
  });
});

test("application server failover replicates critical data within 2 seconds", async () => {
  await withClient(async ({ signIn }) => {
    const admin = await signIn("admin", "admin", "admin-pass");
    const sales = await signIn("sam", "sam", "sam-pass");
    const database = await admin("/api/redundancy/config", json({
      primary: { id: "db", name: "Database", address: "10.1.0.1", componentType: "database" },
      backups: [{ id: "db-2", name: "Database 2", address: "10.1.0.2", componentType: "database" }],
      replication: { mode: "realtime" }
    }, "PUT"));
    assert.equal(database.status, 400);

    const saved = await admin("/api/redundancy/config", json({
      primary: { id: "primary-app", name: "Primary app", address: "10.0.1.1", componentType: "application-server" },
      backups: [
        { id: "backup-app", name: "Backup app", address: "10.0.1.2", componentType: "application-server" },
        { id: "backup-app-2", name: "Backup app 2", address: "10.0.1.3", componentType: "application-server" }
      ],
      replication: { mode: "realtime" }
    }, "PUT"));
    assert.equal(saved.status, 200);
    const salesDenied = await sales("/api/redundancy/config");
    assert.equal(salesDenied.status, 403);

    const quote = await (await sales("/api/quotes", { method: "POST" })).json();
    await sales(`/api/quotes/${quote.id}/lines`, json({ productId: "P-100", quantity: 2 }));
    const before = await (await admin("/api/redundancy/config")).json();
    assert.equal(before.servers[0].revision, before.servers[1].revision);
    assert.deepEqual(before.servers[0].document, before.servers[1].document);
    assert.equal(before.servers[0].document.quotes[0].id, quote.id);

    const failed = await (await admin("/api/redundancy/health", json({ serverId: "primary-app", healthy: false }))).json();
    assert.equal(failed.switched, true);
    assert.equal(failed.activeId, "backup-app");
    assert.ok(failed.switchDurationMs < 2000);
    assert.equal(failed.integrity.ok, true);

    const docs = await (await admin("/api/redundancy/documentation")).json();
    assert.match(docs.text, /Automatic failover runbook/);
    const quarterly = await (await admin("/api/redundancy/quarterly-tests", { method: "POST" })).json();
    assert.equal(quarterly.passed, true);
    assert.equal(quarterly.documented, true);
    assert.ok(quarterly.switchDurationMs < 2000);
    const evidence = await (await admin("/api/redundancy/quarterly-tests")).json();
    assert.equal(evidence.tests.length, 1);
  });
});

test("quote discount threshold, realtime total, and owner-scoped audit log", async () => {
  await withClient(async ({ client, signIn }) => {
    const anonymous = client("anon");
    assert.equal((await anonymous("/api/quotes/apply-discount", json({ quoteId: "missing", discountPercent: 5 }))).status, 401);

    const sam = await signIn("sam", "sam", "sam-pass");
    const pat = await signIn("pat", "pat", "pat-pass");
    const admin = await signIn("admin", "admin", "admin-pass");
    const quote = await (await sam("/api/quotes", { method: "POST" })).json();
    const withLine = await (await sam(`/api/quotes/${quote.id}/lines`, json({ productId: "P-100", quantity: 2 }))).json();
    assert.equal(withLine.subtotal, 258);

    const tooHigh = await sam("/api/quotes/apply-discount", json({ quoteId: quote.id, discountPercent: 15 }));
    assert.equal(tooHigh.status, 400);
    assert.match((await tooHigh.json()).error, /maximum threshold of 10%/);

    const preview = await (await sam("/api/quotes/apply-discount", json({ quoteId: quote.id, discountPercent: 10, preview: true }))).json();
    assert.equal(preview.applied, false);
    assert.equal(preview.total, 232.2);
    assert.equal((await (await sam("/api/discount-logs")).json()).logs.length, 0);

    const applied = await (await sam("/api/quotes/apply-discount", json({ quoteId: quote.id, discountPercent: 10 }))).json();
    assert.equal(applied.applied, true);
    assert.equal(applied.total, 232.2);
    assert.equal(applied.discountPercent, 10);

    const samLogs = await (await sam("/api/discount-logs")).json();
    assert.equal(samLogs.logs.length, 1);
    assert.equal(samLogs.logs[0].userId, "u-sam");
    assert.equal(samLogs.logs[0].previousTotal, 258);
    assert.equal(samLogs.logs[0].newTotal, 232.2);
    assert.equal(samLogs.logs[0].ruleId, "global-max");

    const patLogs = await (await pat("/api/discount-logs")).json();
    assert.equal(patLogs.logs.length, 0);
    assert.equal((await pat(`/api/quotes/${quote.id}`)).status, 404);
    const adminLogs = await (await admin("/api/discount-logs")).json();
    assert.equal(adminLogs.logs.length, 1);

    const submitted = await (await sam(`/api/quotes/${quote.id}/submit`, { method: "POST" })).json();
    assert.equal(submitted.status, "submitted");
    assert.equal(submitted.total, 232.2);
  });
});

test("pages expose the three workflows and enforce roles", async () => {
  await withClient(async ({ client, signIn }) => {
    const anonymous = client("anon");
    assert.equal((await anonymous("/quotes")).status, 401);
    assert.match(await (await anonymous("/login")).text(), /Username/);

    const admin = await signIn("admin", "admin", "admin-pass");
    const loadBalancer = await admin("/load-balancer");
    assert.equal(loadBalancer.status, 200);
    assert.match(await loadBalancer.text(), /Save configuration/);
    const redundancy = await (await admin("/redundancy")).text();
    assert.match(redundancy, /Run test failover/);
    assert.match(redundancy, /Record quarterly test/);
    assert.equal((await admin("/quotes")).status, 403);

    const sam = await signIn("sam", "sam", "sam-pass");
    const quotePage = await sam("/quotes");
    assert.equal(quotePage.status, 200);
    const html = await quotePage.text();
    assert.match(html, /Discount percentage/);
    assert.match(html, /preview: true/);
    assert.match(html, /Submit quote/);
    assert.equal((await sam("/load-balancer")).status, 403);
    assert.equal((await sam("/redundancy")).status, 403);
  });
});
