# Assumptions — availability-pricing-optimization

Recorded during implementation of feature 1117584514. Blocking items are user decisions. Other items are the non-blocking choices required to build the spec without inventing extra product scope.

## User decisions (blocking)

- **BLOCK-1117584514-01 / oq-6.** System Administrators configure load balancing and redundancy and can view all monitoring and discount audit logs. Sales Representatives apply discounts and can view only their own discount logs. Rationale: selected product decision.
- **BLOCK-1117584514-02 / oq-9.** The maximum discount is a single global cap of 10% for every quote, customer, product, and role. Rationale: selected product decision. The cap is stored as the discount rule `global-max`, which is the discount-rules source of validation.
- **BLOCK-1117584514-03 / oq-18.** Redundancy and failover cover application servers only. Databases and storage do not fail over. Rationale: selected product decision.

## Non-blocking choices

- **oq-1 through oq-5.** UI surfaces are a load balancer page, a redundancy page (health, test failover, runbook, quarterly test records), a quote page, and a discount audit page. Rationale: the workspace had no application UI, and these are the flows the spec requires.
- **oq-7.** `GET` and `PUT /api/loadbalancer/config` and `GET` and `PUT /api/redundancy/config`. Success is HTTP 200. Invalid input is HTTP 400 with an actionable message. Missing session is HTTP 401. Wrong role is HTTP 403. Rationale: methods and error bodies were unspecified; read plus save matches the admin flow.
- **oq-8.** `POST /api/quotes/apply-discount` accepts `quoteId`, `discountPercent`, and optional `preview`. It returns `subtotal`, `discountAmount`, `total`, and `applied`. Rationale: those fields are the minimum the quote page needs to show a new total.
- **oq-10.** Currency math uses integer cents. The discount amount is rounded half-up, then subtracted from the subtotal. Rationale: the source gave no rounding rule, and totals must be deterministic.
- **oq-11.** `preview: true` recalculates and returns the total without changing the quote or writing an audit record. A normal apply persists the discount on the draft quote and writes the audit record. Submit is a separate step. Rationale: the spec requires both a real-time total and review before submission.
- **oq-12.** Each applied-discount audit record stores `quoteId`, `userId`, `timestamp`, `discountPercent`, `previousTotal`, `newTotal`, `thresholdPercent`, and `ruleId`. Rationale: the requirement is to trace an application to quote, user, and time.
- **oq-13.** Round robin is even when server request counts differ by at most 1. Least connections assigns each application request to a configured server with the fewest active connections. Rationale: the source did not quantify “evenly,” and these checks are verifiable.
- **oq-14.** The only methods are round robin and least connections. The administrator can change the saved method after reading metrics. The system does not switch algorithms on its own. Rationale: automatic selection rules were undefined and must not be assumed.
- **oq-15.** Session persistence is not implemented. Rationale: requirements say not to invent a persistence technique.
- **oq-16.** Monitoring shows per-server request count, active connections, traffic share, and last route time in milliseconds. Rationale: those are the traffic and performance signals named by the source.
- **oq-17.** A qualifying failure is an application server health check reported as unhealthy, or an administrator-started failover test. Rationale: exact failure events were unspecified; both paths are source-supported.
- **oq-19.** Critical data is the application-server document: quote drafts and the load-balancer routing cursor. It is copied to backup application servers on each change. Database and storage replication are out of scope. Rationale: failover scope is application servers only, and “critical data” was otherwise undefined.
- **oq-20 / oq-21.** Failover documentation is the in-application runbook. Quarterly evidence is a stored test record with quarter, time, switch duration, and integrity result. Rationale: the system must document and record tests; an external document store was not specified.
- **oq-22.** Pages use semantic labels, keyboard-operable controls, and text errors. No additional accessibility standard was specified.
- **oq-23.** Records remain in process memory for the life of the server. No retention period was specified, so none was invented.
- **oq-24.** The feature is one Node.js process with no extra infrastructure. Rationale: the selected architecture is a monolith, and this checkout had no application stack. The implementation-check warning of a single module is expected for this workspace.

## Explicitly not implemented

- Session persistence techniques.
- Automatic load-balancer algorithm switching.
- Failover of databases or storage.
- Manual failover.
- Discount caps that vary by customer, product, quote type, or role.
- Load balancing of non-application traffic.
