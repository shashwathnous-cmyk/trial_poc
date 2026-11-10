import crypto from "node:crypto";

export const PRODUCTS = [
  { id: "P-100", name: "Rotary hammer", unitPrice: 129 },
  { id: "P-200", name: "Cutting blade", unitPrice: 18.5 },
  { id: "P-300", name: "Anchor bolt", unitPrice: 7.25 }
];

export const FAILOVER_RUNBOOK = [
  "Automatic failover runbook for application servers.",
  "1. Configure one primary application server and at least one backup application server.",
  "2. Set replication mode to realtime. Critical application data is copied to every backup on each change.",
  "3. When the active application server is reported unhealthy, promote the first healthy backup.",
  "4. The switch must finish within 2 seconds. Manual failover is not part of this process.",
  "5. After the switch, confirm the backup critical-data revision matches the last primary revision.",
  "6. Run this test once each quarter and keep the stored test record."
].join("\n");

export function createState() {
  return {
    users: [
      { id: "u-admin", username: "admin", password: "admin-pass", role: "system-administrator" },
      { id: "u-sam", username: "sam", password: "sam-pass", role: "sales-representative" },
      { id: "u-pat", username: "pat", password: "pat-pass", role: "sales-representative" }
    ],
    sessions: new Map(),
    securityEvents: [],
    loadBalancer: {
      config: null,
      applied: false,
      cursor: 0,
      stats: {}
    },
    redundancy: {
      configured: false,
      servers: [],
      activeId: null,
      documentation: FAILOVER_RUNBOOK,
      events: [],
      quarterlyTests: []
    },
    products: PRODUCTS.map((product) => ({ ...product })),
    quotes: new Map(),
    discountRule: { id: "global-max", maxPercent: 10, scope: "global" },
    discountLogs: []
  };
}

export function elapsedMs(started) {
  return Number(process.hrtime.bigint() - started) / 1e6;
}

export function newId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString("hex")}`;
}

export function passwordsMatch(actual, given) {
  const left = crypto.createHash("sha256").update(String(actual)).digest();
  const right = crypto.createHash("sha256").update(String(given)).digest();
  return crypto.timingSafeEqual(left, right);
}
