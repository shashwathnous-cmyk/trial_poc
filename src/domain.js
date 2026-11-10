import crypto from "node:crypto";
import { elapsedMs, newId, passwordsMatch } from "./state.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireText(value, message) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, message);
  }
  return value.trim();
}

function recordSecurity(state, event) {
  state.securityEvents.push({ at: new Date().toISOString(), ...event });
}

export function login(state, body) {
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const user = state.users.find((candidate) => candidate.username === username);
  if (!user || !passwordsMatch(user.password, password)) {
    recordSecurity(state, { type: "login-failed", username });
    throw new HttpError(401, "Sign-in failed. Check the username and password.");
  }
  const sid = crypto.randomBytes(24).toString("hex");
  state.sessions.set(sid, { userId: user.id, username: user.username, role: user.role });
  recordSecurity(state, { type: "login", userId: user.id, role: user.role });
  return { sid, user: publicUser(user) };
}

export function logout(state, sid) {
  state.sessions.delete(sid);
}

export function currentUser(state, sid) {
  if (!sid) return null;
  const session = state.sessions.get(sid);
  if (!session) return null;
  return publicUser(state.users.find((user) => user.id === session.userId));
}

export function authorize(state, sid, roles) {
  const session = sid ? state.sessions.get(sid) : null;
  if (!session) {
    throw new HttpError(401, "Sign in to continue.");
  }
  if (!roles.includes(session.role)) {
    recordSecurity(state, { type: "access-denied", userId: session.userId, role: session.role });
    throw new HttpError(403, "You do not have access to this action.");
  }
  return session;
}

function publicUser(user) {
  return { id: user.id, username: user.username, role: user.role };
}

function validatePoolServer(server, index) {
  if (!server || typeof server !== "object") {
    throw new HttpError(400, `Server ${index + 1} is missing. Provide an id, name, and address.`);
  }
  return {
    id: requireText(server.id, `Server ${index + 1} needs an id.`),
    name: requireText(server.name, `Server ${index + 1} needs a name.`),
    address: requireText(server.address, `Server ${index + 1} needs an address.`)
  };
}

export function saveLoadBalancer(state, actor, body) {
  if (!Array.isArray(body?.servers) || body.servers.length < 2) {
    throw new HttpError(400, "Select at least two servers for the load balancer.");
  }
  const method = body?.method;
  if (method !== "round-robin" && method !== "least-connections") {
    throw new HttpError(400, "Choose a load balancing method: round robin or least connections.");
  }
  const servers = body.servers.map(validatePoolServer);
  if (new Set(servers.map((server) => server.id)).size !== servers.length) {
    throw new HttpError(400, "Server ids must be unique.");
  }
  const config = {
    servers,
    method,
    savedAt: new Date().toISOString(),
    savedBy: actor.userId
  };
  state.loadBalancer.config = config;
  state.loadBalancer.applied = true;
  state.loadBalancer.cursor = 0;
  state.loadBalancer.stats = Object.fromEntries(servers.map((server) => [server.id, {
    requestCount: 0,
    activeConnections: 0,
    lastElapsedMs: 0
  }]));
  recordSecurity(state, { type: "load-balancer-config-saved", userId: actor.userId, method });
  syncCritical(state);
  return { ok: true, applied: true, config };
}

export function getLoadBalancer(state) {
  return {
    applied: state.loadBalancer.applied,
    config: state.loadBalancer.config
  };
}

function pickServer(state) {
  const servers = state.loadBalancer.config.servers;
  if (state.loadBalancer.config.method === "round-robin") {
    const server = servers[state.loadBalancer.cursor % servers.length];
    state.loadBalancer.cursor += 1;
    return server;
  }
  return [...servers].sort((left, right) => {
    const leftStats = state.loadBalancer.stats[left.id];
    const rightStats = state.loadBalancer.stats[right.id];
    return leftStats.activeConnections - rightStats.activeConnections
      || leftStats.requestCount - rightStats.requestCount
      || left.id.localeCompare(right.id);
  })[0];
}

export function routeTraffic(state, body) {
  if (!state.loadBalancer.applied) {
    throw new HttpError(409, "Save a load balancer configuration before routing application traffic.");
  }
  const trafficClass = body?.trafficClass;
  if (trafficClass !== "application" && trafficClass !== "non-application") {
    throw new HttpError(400, "Set trafficClass to application or non-application.");
  }
  const started = process.hrtime.bigint();
  if (trafficClass === "non-application") {
    return {
      routed: false,
      excluded: true,
      reason: "Non-application traffic is outside load balancing scope.",
      elapsedMs: elapsedMs(started)
    };
  }
  const server = pickServer(state);
  const stats = state.loadBalancer.stats[server.id];
  stats.requestCount += 1;
  if (body?.hold === true) stats.activeConnections += 1;
  const elapsed = elapsedMs(started);
  stats.lastElapsedMs = elapsed;
  if (elapsed >= 2000) {
    throw new HttpError(503, "The load-balanced response took 2 seconds or longer.");
  }
  syncCritical(state);
  return {
    routed: true,
    serverId: server.id,
    serverName: server.name,
    method: state.loadBalancer.config.method,
    elapsedMs: elapsed,
    distribution: distribution(state)
  };
}

export function releaseConnection(state, body) {
  const serverId = requireText(body?.serverId, "Provide the serverId to release.");
  const stats = state.loadBalancer.stats[serverId];
  if (!stats) throw new HttpError(400, "That server is not in the applied load balancer pool.");
  if (stats.activeConnections < 1) {
    throw new HttpError(409, "That server has no held connection to release.");
  }
  stats.activeConnections -= 1;
  return getMetrics(state);
}

function distribution(state) {
  const servers = state.loadBalancer.config?.servers ?? [];
  const total = servers.reduce((sum, server) => sum + state.loadBalancer.stats[server.id].requestCount, 0);
  return servers.map((server) => {
    const stats = state.loadBalancer.stats[server.id];
    return {
      id: server.id,
      name: server.name,
      requestCount: stats.requestCount,
      activeConnections: stats.activeConnections,
      share: total === 0 ? 0 : stats.requestCount / total,
      lastElapsedMs: stats.lastElapsedMs
    };
  });
}

export function getMetrics(state) {
  if (!state.loadBalancer.applied) {
    return { applied: false, servers: [], even: false, responseTimeLimitMs: 2000 };
  }
  const servers = distribution(state);
  const counts = servers.map((server) => server.requestCount);
  const even = counts.length > 0 && Math.max(...counts) - Math.min(...counts) <= 1;
  return {
    applied: true,
    method: state.loadBalancer.config.method,
    servers,
    even,
    responseTimeLimitMs: 2000
  };
}

function validateAppServer(server, label) {
  if (!server || typeof server !== "object") {
    throw new HttpError(400, `Provide the ${label} application server.`);
  }
  if (server.componentType && server.componentType !== "application-server") {
    throw new HttpError(400, "Only application servers are in scope for redundancy and failover.");
  }
  return {
    id: requireText(server.id, `The ${label} application server needs an id.`),
    name: requireText(server.name, `The ${label} application server needs a name.`),
    address: requireText(server.address, `The ${label} application server needs an address.`),
    componentType: "application-server"
  };
}

function emptyCritical() {
  return { revision: 0, document: { quotes: [], loadBalancerCursor: 0 }, updatedAt: null };
}

export function saveRedundancy(state, actor, body) {
  const primary = validateAppServer(body?.primary, "primary");
  if (!Array.isArray(body?.backups) || body.backups.length < 1) {
    throw new HttpError(400, "Configure at least one backup application server.");
  }
  const backups = body.backups.map((server, index) => validateAppServer(server, `backup ${index + 1}`));
  const ids = [primary.id, ...backups.map((server) => server.id)];
  if (new Set(ids).size !== ids.length) {
    throw new HttpError(400, "Application server ids must be unique.");
  }
  if (body?.replication?.mode !== "realtime") {
    throw new HttpError(400, "Set replication mode to realtime.");
  }
  const document = currentDocument(state);
  const critical = { revision: 1, document, updatedAt: new Date().toISOString() };
  state.redundancy.configured = true;
  state.redundancy.servers = [
    { ...primary, role: "primary", healthy: true, criticalData: structuredClone(critical) },
    ...backups.map((server) => ({
      ...server,
      role: "backup",
      healthy: true,
      criticalData: structuredClone(critical)
    }))
  ];
  state.redundancy.activeId = primary.id;
  recordSecurity(state, { type: "redundancy-config-saved", userId: actor.userId });
  return getRedundancy(state);
}

function currentDocument(state) {
  return {
    quotes: [...state.quotes.values()],
    loadBalancerCursor: state.loadBalancer.cursor
  };
}

function syncCritical(state) {
  if (!state.redundancy.configured) return;
  const active = activeServer(state);
  const next = {
    revision: active.criticalData.revision + 1,
    document: currentDocument(state),
    updatedAt: new Date().toISOString()
  };
  for (const server of state.redundancy.servers) {
    server.criticalData = structuredClone(next);
  }
}

function activeServer(state) {
  const server = state.redundancy.servers.find((candidate) => candidate.id === state.redundancy.activeId);
  if (!server) throw new HttpError(409, "Configure redundancy before using failover.");
  return server;
}

export function getRedundancy(state) {
  return {
    configured: state.redundancy.configured,
    activeId: state.redundancy.activeId,
    scope: "application-servers",
    replication: state.redundancy.configured ? { mode: "realtime" } : null,
    servers: state.redundancy.servers.map((server) => publicServer(server, state.redundancy.activeId)),
    integrity: state.redundancy.configured ? verifyIntegrity(state) : null
  };
}

function publicServer(server, activeId) {
  return {
    id: server.id,
    name: server.name,
    address: server.address,
    componentType: server.componentType,
    role: server.role,
    healthy: server.healthy,
    active: server.id === activeId,
    revision: server.criticalData.revision,
    document: server.criticalData.document
  };
}

export function getHealth(state) {
  if (!state.redundancy.configured) {
    throw new HttpError(409, "Configure primary and backup application servers before checking health.");
  }
  return {
    checkedAt: new Date().toISOString(),
    activeId: state.redundancy.activeId,
    servers: state.redundancy.servers.map((server) => publicServer(server, state.redundancy.activeId))
  };
}

export function reportHealth(state, body) {
  if (!state.redundancy.configured) {
    throw new HttpError(409, "Configure redundancy before reporting application server health.");
  }
  const serverId = requireText(body?.serverId, "Provide the application server id.");
  const server = state.redundancy.servers.find((candidate) => candidate.id === serverId);
  if (!server) throw new HttpError(400, "That application server is not part of the redundancy configuration.");
  if (typeof body?.healthy !== "boolean") {
    throw new HttpError(400, "Set healthy to true or false.");
  }
  server.healthy = body.healthy;
  if (!body.healthy && state.redundancy.activeId === server.id) {
    return promote(state, "health-failure");
  }
  return { switched: false, health: getHealth(state) };
}

function promote(state, reason) {
  const started = process.hrtime.bigint();
  const currentId = state.redundancy.activeId;
  const backup = state.redundancy.servers.find((server) => server.healthy && server.id !== currentId);
  if (!backup) {
    throw new HttpError(503, "No healthy backup application server is available for failover.");
  }
  state.redundancy.activeId = backup.id;
  const switchDurationMs = elapsedMs(started);
  if (switchDurationMs >= 2000) {
    throw new HttpError(503, "Failover exceeded the 2 second limit.");
  }
  const integrity = verifyIntegrity(state);
  const event = {
    at: new Date().toISOString(),
    reason,
    fromId: currentId,
    activeId: backup.id,
    switchDurationMs,
    integrityOk: integrity.ok,
    revision: integrity.revision
  };
  state.redundancy.events.push(event);
  return { switched: true, ...event, integrity };
}

export function verifyIntegrity(state) {
  if (!state.redundancy.configured) {
    throw new HttpError(409, "Configure redundancy before verifying data integrity.");
  }
  const copies = state.redundancy.servers.map((server) => JSON.stringify(server.criticalData));
  const ok = new Set(copies).size === 1;
  return {
    ok,
    revision: state.redundancy.servers[0]?.criticalData.revision ?? null,
    activeId: state.redundancy.activeId
  };
}

export function testFailover(state) {
  if (!state.redundancy.configured) {
    throw new HttpError(409, "Configure redundancy before starting a failover test.");
  }
  const active = activeServer(state);
  active.healthy = false;
  const result = promote(state, "test");
  return { ...result, documentationPresent: state.redundancy.documentation.trim().length > 0 };
}

export function getDocumentation(state) {
  return { text: state.redundancy.documentation };
}

export function saveDocumentation(state, actor, body) {
  const text = requireText(body?.text, "Enter the failover runbook text.");
  state.redundancy.documentation = text;
  recordSecurity(state, { type: "failover-documentation-saved", userId: actor.userId });
  return getDocumentation(state);
}

export function runQuarterlyTest(state, actor) {
  const result = testFailover(state);
  const now = new Date();
  const quarter = `${now.getUTCFullYear()}-Q${Math.floor(now.getUTCMonth() / 3) + 1}`;
  const record = {
    id: newId("qtest"),
    quarter,
    testedAt: now.toISOString(),
    testedBy: actor.userId,
    passed: result.switched === true && result.integrityOk === true && result.switchDurationMs < 2000,
    switchDurationMs: result.switchDurationMs,
    integrityOk: result.integrityOk,
    activeId: result.activeId,
    documented: state.redundancy.documentation.trim().length > 0
  };
  state.redundancy.quarterlyTests.push(record);
  return record;
}

export function listQuarterlyTests(state) {
  return { tests: state.redundancy.quarterlyTests, documentation: state.redundancy.documentation };
}

export function listProducts(state) {
  return { products: state.products };
}

function quoteSubtotalCents(quote) {
  return quote.lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
}

function publicQuote(quote, rule) {
  const subtotalCents = quoteSubtotalCents(quote);
  const applied = quote.discountPercent !== null;
  const priced = applied
    ? calculateDiscount(subtotalCents / 100, quote.discountPercent)
    : { subtotal: subtotalCents / 100, discountAmount: 0, total: subtotalCents / 100 };
  return {
    id: quote.id,
    ownerId: quote.ownerId,
    status: quote.status,
    lines: quote.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotalCents / 100
    })),
    discountPercent: quote.discountPercent,
    thresholdPercent: rule.maxPercent,
    subtotal: priced.subtotal,
    discountAmount: priced.discountAmount,
    total: priced.total
  };
}

export function calculateDiscount(subtotal, percent) {
  const subtotalCents = Math.round(Number(subtotal) * 100);
  const discountCents = Math.round(subtotalCents * Number(percent) / 100);
  return {
    subtotal: subtotalCents / 100,
    discountAmount: discountCents / 100,
    total: (subtotalCents - discountCents) / 100
  };
}

export function createQuote(state, actor) {
  const quote = {
    id: newId("quote"),
    ownerId: actor.userId,
    status: "draft",
    lines: [],
    discountPercent: null
  };
  state.quotes.set(quote.id, quote);
  syncCritical(state);
  return publicQuote(quote, state.discountRule);
}

export function ownQuote(state, actor) {
  const drafts = [...state.quotes.values()].filter((quote) => quote.ownerId === actor.userId && quote.status === "draft");
  return { quote: drafts.length ? publicQuote(drafts[drafts.length - 1], state.discountRule) : null };
}

function findOwnedQuote(state, actor, quoteId) {
  const quote = state.quotes.get(quoteId);
  if (!quote || quote.ownerId !== actor.userId) {
    throw new HttpError(404, "Quote not found.");
  }
  return quote;
}

export function addQuoteLine(state, actor, quoteId, body) {
  const quote = findOwnedQuote(state, actor, quoteId);
  if (quote.status !== "draft") throw new HttpError(409, "This quote has already been submitted.");
  const product = state.products.find((candidate) => candidate.id === body?.productId);
  if (!product) throw new HttpError(400, "Select a product from the catalog.");
  const quantity = Number(body?.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new HttpError(400, "Enter a whole quantity of at least 1.");
  }
  const existing = quote.lines.find((line) => line.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
    existing.lineTotalCents = Math.round(product.unitPrice * 100) * existing.quantity;
  } else {
    quote.lines.push({
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.unitPrice,
      lineTotalCents: Math.round(product.unitPrice * 100) * quantity
    });
  }
  syncCritical(state);
  return publicQuote(quote, state.discountRule);
}

export function getQuote(state, actor, quoteId) {
  return publicQuote(findOwnedQuote(state, actor, quoteId), state.discountRule);
}

export function applyDiscount(state, actor, body) {
  const quote = findOwnedQuote(state, actor, body?.quoteId);
  if (quote.status !== "draft") throw new HttpError(409, "This quote has already been submitted.");
  if (quote.lines.length === 0) throw new HttpError(400, "Add at least one product before applying a discount.");
  const percent = Number(body?.discountPercent);
  if (!Number.isFinite(percent)) {
    throw new HttpError(400, "Enter a discount percentage.");
  }
  const rule = state.discountRule;
  if (percent < 0) {
    throw new HttpError(400, "Enter a discount percentage of 0 or greater.");
  }
  if (percent > rule.maxPercent) {
    throw new HttpError(400, `Discount of ${percent}% exceeds the maximum threshold of ${rule.maxPercent}%.`);
  }
  const previous = publicQuote(quote, rule);
  const priced = calculateDiscount(previous.subtotal, percent);
  if (body?.preview === true) {
    return { ...priced, quoteId: quote.id, discountPercent: percent, applied: false, thresholdPercent: rule.maxPercent };
  }
  const log = {
    id: newId("audit"),
    quoteId: quote.id,
    userId: actor.userId,
    timestamp: new Date().toISOString(),
    discountPercent: percent,
    previousTotal: previous.total,
    newTotal: priced.total,
    thresholdPercent: rule.maxPercent,
    ruleId: rule.id
  };
  state.discountLogs.push(log);
  quote.discountPercent = percent;
  syncCritical(state);
  return { ...publicQuote(quote, rule), applied: true, auditId: log.id };
}

export function submitQuote(state, actor, quoteId) {
  const quote = findOwnedQuote(state, actor, quoteId);
  if (quote.status !== "draft") throw new HttpError(409, "This quote has already been submitted.");
  if (quote.discountPercent === null) {
    throw new HttpError(400, "Apply the discount, including 0% when no discount is offered, and review the total before submitting.");
  }
  quote.status = "submitted";
  syncCritical(state);
  return publicQuote(quote, state.discountRule);
}

export function listDiscountLogs(state, actor) {
  const logs = actor.role === "system-administrator"
    ? state.discountLogs
    : state.discountLogs.filter((log) => log.userId === actor.userId);
  return { logs };
}

export function listSecurityEvents(state) {
  return { events: state.securityEvents };
}
