# Golden Repository Implementation Guidelines

Generated for: HIlti
Repository: Automotive Standard
Generated at: 2026-11-02T11:13:59.410Z
File selection mode: selected mapped files

## Warnings

- None

## How To Use

- Read this file before implementation in the IDE.
- Use `golden-repo-sources.md` for exact source excerpts and file-path attribution.
- Use Golden Repo guidance for conventions, patterns, validation expectations, architecture style, testing expectations, and implementation constraints.
Golden Repo grounding rules:
- If a selected Golden Repo reference states a rule, constraint, term, or pattern that applies to this feature, the spec must reflect it and cite that file path in Source References.
- Do not force unrelated Golden Repo concepts into the specification. If a reference does not apply to this feature, leave it out.
- Do not invent implementation details that are absent from the Golden Repo or the requirement. Exact endpoints, hosts, schemas, tables, queue names, and infrastructure components that are not stated must be marked Validate or left as Open Questions.
- Also incorporate applicable UI design guidelines, architecture guidelines, policies, business rules, standards, and validation expectations when they apply to this feature.
- If a relevant Golden Repo rule applies but the feature source lacks a product decision, write the gap under Open Questions instead of inventing behavior.
- If a user story conflicts with a Golden Repo example, follow the user story for what to build and keep only the Golden Repo terminology and rules that still apply.
- Cite the Golden Repo file paths of the references you actually used in Source References.
- Existing code patterns in the target workspace override generic Golden Repo guidance when they conflict on stack mechanics.
- Do not require live Golden Repository access inside the implementation workspace.

## Extracted Guidance

GOLDEN REPO KNOWLEDGE CONTEXT (spec generation)
Repository: Automotive Standard
The following is a distilled, de-duplicated consolidation of Golden Repository conventions. Use a convention only when it is materially relevant to the requested feature. Do not force unrelated concepts into the specification. Do not invent endpoints, hosts, schemas, tables, or queue names that this consolidation does not state; mark those as Validate.

## Architecture & System Design

### Integration Compatibility

- [G1] New mobile application features must be compatible with existing systems to avoid integration failure.
- [G2] Use a compatibility layer for API versioning.
- [G3] Treat integration with existing systems as a critical dependency for project success.

### Integration Risk Mitigation

- [G4] Conduct thorough integration testing.
- [G5] Engage stakeholders early to reduce integration risk.
- [G6] Provide a fallback plan for manual integration.

### Data Migration Resilience

- [G7] Implement robust data backup strategies before migration.
- [G8] Validate data post-migration.
- [G9] Support rollback to the previous version if migration issues occur.

### Feature Rollout Safety

- [G10] Implement rigorous feature flag testing.
- [G11] Monitor feature flag performance during rollout.
- [G12] Roll back features if feature flag issues are detected.

### Performance, Scaling, and Monitoring

- [G13] Optimize system performance for quick action execution.
- [G14] Scale resources as needed as a contingency for performance issues.
- [G15] Establish a monitoring dashboard.
- [G16] Set up alerts for anomalies.

## Security & Compliance

### Access Control and Authorization

- [G17] Implement strict role-based access control and authorization.
- [G18] Prevent unauthorized data access.
- [G19] Monitor access logs daily with a threshold of **0 unauthorized access**.
- [G20] Respond immediately to access violations.

### Audit Trails and Logging

- [G21] Audit trail and compliance reporting must satisfy applicable audit trail regulations.
- [G22] Audit logs must be complete and accurate.
- [G23] Audit logs must be exportable.
- [G24] Test audit log export functionality thoroughly.
- [G25] Monitor audit log export success monthly with a **100% success** threshold.

### Compliance Management

- [G26] Establish clear compliance guidelines.
- [G27] Train staff on compliance requirements.
- [G28] Conduct regular security audits.
- [G29] Monitor compliance audit results monthly with a **95% compliance** threshold.

### Incident, Risk, and Legal Response

- [G30] Compliance violations resulting from audit trail failures may lead to legal penalties.
- [G31] Obtain legal consultation as the contingency response for potential compliance violations.

### Pending Governance Items

- [G32] Finalization of compliance guidelines and audit processes is pending stakeholder review.

## Testing & Quality Expectations

### Integration Testing

- [G33] Conduct thorough integration testing to verify successful integration of features.
- [G34] Monitor integration test results weekly.
- [G35] Maintain an integration test pass rate threshold of at least 80%.

### Performance & Load Testing

- [G36] Conduct load testing to mitigate performance issues.
- [G37] Ensure system performance metrics meet SLAs.

### Migration Validation

- [G38] Validate data post-migration.
- [G39] Ensure each migration cycle completes successfully using migration logs.
- [G40] Verify that data is securely migrated.

### Audit Logging & Export Testing

- [G41] Test audit log export functionality thoroughly.
- [G42] Verify audit logs are complete and accurate.
- [G43] Confirm audit logs can be exported.

### Feature Flags & Monitoring

- [G44] Implement rigorous feature flag testing.
- [G45] Verify feature flags are functioning correctly.
- [G46] Confirm monitoring alerts trigger correctly.

### Security & Access Validation

- [G47] Verify unauthorized access is prevented.

### Operational / Adoption Validation

- [G48] Verify follow-up entries are efficiently managed.
- [G49] Monitor user adoption metrics.

### Risk-Impacted Acceptance Criteria

- [G50] Acceptance criteria impacted by risks include validation that:
  - Successful integration of features is achieved.
  - Unauthorized access is prevented.
  - Audit logs are complete and accurate.
  - System performance metrics meet SLAs.
  - Follow-up entries are efficiently managed.
  - Data is securely migrated.
  - User adoption metrics are monitored.
  - Audit logs can be exported.
  - Feature flags are functioning correctly.
  - Monitoring alerts trigger correctly.

## UI/UX & Accessibility

### No implementation guidance available

- [G51] No implementation guidance present for this category.

## Domain & Business Rules

### Risk Scoring Rules

- [G52] Calculate risk score as:
  - **Risk Score = Probability × Impact**

### Risk Probability Scale

- [G53] Use the following probability scale:
  - **1 = Rare**
  - **2 = Unlikely**
  - **3 = Possible**
  - **4 = Likely**
  - **5 = Almost Certain**

### Risk Impact Scale

- [G54] Use the following impact scale:
  - **1 = Insignificant**
  - **2 = Minor**
  - **3 = Moderate**
  - **4 = Major**
  - **5 = Catastrophic**

### Risk Severity Thresholds

- [G55] Classify risk severity by score as:
  - **Low:** 1–5
  - **Medium:** 6–10
  - **High:** 11–15
  - **Critical:** 16–25

### Adoption and Feedback Monitoring Rules

- [G56] Monitor user adoption monthly against a **70% adoption threshold**.
- [G57] Monitor **positive feedback rate** on a **bi-weekly** basis for follow-up management.

### Business Assumptions

- [G58] Assume all user roles are trained on new system functionalities.

## Error Handling & Resilience

### Contingency Plans by Failure Type

- [G59] For integration failure, maintain a fallback plan for manual integration.
- [G60] For unauthorized access violations, use immediate response procedures.
- [G61] For compliance violations, use legal consultation as a contingency.
- [G62] For performance issues, scale resources as needed.
- [G63] For inefficient follow-up management, use manual follow-up tracking until resolved.
- [G64] For migration issues, roll back to the previous version if necessary.
- [G65] For audit log export failure, use manual log compilation.
- [G66] For monitoring instability, use manual monitoring until automated alerts are stable.

### Escalation Levels

- [G67] **Level 1: Minor issues**
  - Notify the responsible owner for immediate resolution.
- [G68] **Level 2: Moderate issues**
  - Escalate to the project manager if unresolved within 24 hours.
- [G69] **Level 3: Critical issues**
  - Immediately escalate to the executive team for urgent resolution.

## Performance & Observability

### Performance Monitoring

- [G70] Monitor performance metrics weekly using a performance dashboard.
  - Treat performance falling below SLA thresholds as a risk.
- [G71] Monitor feature flag performance weekly using a feature flagging tool.
  - Threshold: no failures.

### Operational Alerting

- [G72] Monitor alerts daily via a monitoring dashboard.
  - Immediate alerts are required.
- [G73] Monitoring alert triggers are an acceptance criterion for quick action creation and execution.

### Test and Integration Monitoring

- [G74] Monitor integration test results weekly via the CI/CD pipeline.

### Logging and Audit Monitoring

- [G75] Monitor access logs daily via a security monitoring tool.
- [G76] Monitor compliance audit results monthly via an audit tool.
- [G77] Monitor audit log export success monthly via an audit tool.

### Data Migration Monitoring

- [G78] Monitor data migration logs for each migration cycle via a migration tool.

### User and Adoption Observability

- [G79] Monitor user feedback bi-weekly via feedback surveys.
- [G80] Monitor user adoption metrics monthly via user analytics.