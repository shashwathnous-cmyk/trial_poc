# Feature: Procurement Portal Lifecycle Foundation
Status: NEW
Owner: Astra
Last Updated: 2026-08-23

## Summary
Procurement Portal Lifecycle Foundation establishes the procurement portal as the primary web-based entry point for users participating in the procurement lifecycle. The feature delivers the minimum production-ready foundation required to make the portal usable, secure, traceable, and supportable without inventing unsupported lifecycle workflow detail that the BRD leaves TBD.

This feature covers:
- authenticated portal access using simple portal sign-in,
- persistent portal navigation and landing-page access patterns,
- procurement request creation and draft save,
- procurement request detail viewing with current lifecycle status and chronological history,
- audit trail capture, retrieval, and export for tracked portal actions,
- configurable lifecycle states and transition validation.

The expected outcome is a monolith-based web portal that allows authorized users to sign in, navigate procurement areas, create and resume requests, view request status and history, and support governance through auditable actions and configuration-driven lifecycle control.

## Scope
### In Scope
- Web-based procurement portal foundation.
- Simple portal authentication and session management.
- Protection of authenticated and authorized routes.
- Persistent primary navigation and breadcrumbs for multi-level pages.
- Procurement portal landing page access to supported portal areas.
- Procurement request creation with baseline required information.
- Draft save and later resume of the same procurement request.
- Procurement request retrieval by direct URL or refresh when the user remains authorized.
- Display of current lifecycle status on procurement request detail.
- Display of procurement request status history in chronological order with timestamps and action context.
- Empty, loading, and recoverable error states for relevant portal interactions.
- Audit capture for tracked actions including request creation, draft save, status change, and authentication events.
- Audit retrieval in chronological order for a selected procurement request or event filter.
- Audit export in a reviewable format, with export action itself audited.
- Configuration-driven lifecycle states and allowed transitions.
- Validation of status changes against configured transitions.
- Restriction of workflow configuration changes to authorized roles.
- Monolith-oriented implementation aligned to retrieved organizational guidance for navigation, accessibility, monitoring, security, auditability, and implementation standards.

### Out of Scope
- Enterprise SSO, external identity federation, and multi-factor authentication.
- Self-service registration and password reset.
- Expanded RBAC design beyond source-supported authorized roles and route/configuration restrictions.
- Definition of final procurement approval matrix, approval conditions, escalation thresholds, or parallel approvals.
- Detailed workflow steps, fallback behavior, or exception handling not specified in source.
- Dashboard customization, personalized navigation, or search-based navigation.
- Predictive analytics, dashboard reporting beyond individual request status, or anomaly detection.
- Supplier onboarding, contract authoring, invoice processing, external supplier systems, and financial integrations.
- Regulatory filing generation or external records-management integration.
- Distributed microservice architecture patterns.
- Delivery schedules, sprint planning outputs, or TDD-specific artifacts.

## Application Type & Platform Context
### Application Type
Mixed, with primary emphasis on a web portal plus supporting API operations.

### Platform Context
Source evidence states the procurement portal is the “primary web-based solution” and describes web screens and browser behaviors including:
- sign-in page,
- landing page,
- persistent navigation,
- breadcrumbs,
- browser refresh,
- direct URL entry,
- browser back-forward actions.

Source-supported API contracts are also explicitly referenced for authentication, procurement requests, history, audit, navigation, and configuration.

### Architectural Context
- User-selected architecture style: monolith.
- This feature must be implemented as a monolith-oriented solution and must not introduce distributed-service scope not present in source.

## Actors and Permissions
### Actors
1. **Procurement Portal User**
   - Can sign in to the portal.
   - Can access protected procurement lifecycle functions when authenticated.
   - Can navigate authorized portal routes.
   - Can create procurement requests.
   - Can save procurement requests as drafts.
   - Can resume saved draft requests.
   - Can view procurement request detail, current lifecycle status, and status history for authorized requests.

2. **Procurement Compliance Analyst**
   - Can retrieve procurement audit history in chronological order for a selected procurement request or event filter, when authorized.
   - Can export audit results for review support, when authorized.

3. **Procurement Process Owner**
   - Needs lifecycle states and transitions to be configurable.
   - Workflow configuration changes must be restricted to authorized roles.
   - Source mentions “authorized administrators or process owners” in technical considerations for configuration endpoints.

### Permission and Access Constraints
- All protected portal routes require authentication.
- Unauthorized users must be blocked from procurement request detail and history endpoints and must not receive request information for restricted identifiers.
- Unauthorized procurement routes must be hidden from navigation menus.
- Direct access attempts to unauthorized routes must be blocked server-side.
- Unauthorized users must be prevented from viewing, modifying, or deleting audit records.
- Workflow configuration endpoints must be accessible only to authorized roles.
- Role-based access specifics beyond the above are not defined in the source.

## Feature Development Intent
This is feature-development work to establish the foundational procurement portal capability required by the BRD and selected user stories. The work must build new end-user and administrative behaviors rather than refine an existing mature portal.

The intended delivery is a production-ready foundation that:
- creates a secure authenticated entry point,
- enables usable navigation across procurement portal areas,
- supports intake of procurement work through request creation and draft save,
- exposes request status and history for transparency,
- records and protects an immutable audit trail for tracked actions,
- enforces configuration-driven lifecycle transition rules without hardcoding unsupported business process assumptions.

The implementation must remain intentionally limited to supported source scope and avoid inventing unapproved procurement process detail.

## UI Design & Interaction Contract
### General UI Contract
- The portal is web-based.
- UI must align with source-referenced design guidelines and organizational guidance for navigation, accessibility, and web delivery.
- Labels must be visible on sign-in and form inputs; placeholder-only labels are not permitted.
- Related fields on the procurement request form must be logically grouped.
- Inline validation messages must be shown for missing or invalid input.
- Loading indicators must be shown for asynchronous actions.
- Error and empty states must be explicit and must not leave areas blank.
- Keyboard-accessible controls are required.
- Navigation must remain visible during loading, empty, and recoverable error states.
- Active navigation highlighting must be visually consistent with design guidelines.
- Breadcrumbs must be shown on multi-level procurement pages.
- Only one primary action button per screen is supported by applicable Golden Repo guidance; where applied, screens defined in source must not present competing primary actions.

### Sign-In Page
The system shall provide a sign-in page with:
- visible field labels,
- keyboard-accessible controls,
- a single primary action button,
- inline validation and error messaging for missing or invalid credentials.

Behavior:
- Valid credentials authenticate the user and redirect to the procurement portal landing page.
- Invalid or missing credentials show inline error messages explaining what must be corrected.
- If session is expired or invalid, user is redirected to sign-in and shown a clear message that the session is no longer valid.

### Portal Landing and Navigation
The system shall provide:
- a procurement portal landing page,
- persistent primary navigation on portal pages,
- active-section highlighting,
- breadcrumbs on multi-level pages.

Behavior:
- Direct URL entry, browser refresh, and back-forward navigation must preserve authorized route context and must not break the page.
- Unauthorized routes must not appear in menus.
- Unauthorized direct route access must be blocked server-side.

### Create Procurement Request Page
The system shall provide a procurement request form with:
- visible labels,
- logically grouped fields,
- inline validation messages,
- loading states during save operations.

Behavior:
- Missing required baseline information prevents creation and triggers field-level messages.
- Valid submission creates a request and returns confirmation including a unique request identifier and initial lifecycle status.
- Draft save allows later resume without loss of previously saved information.
- Repeated clicks or retry after transient interruption must not create duplicate requests.

### Procurement Request Detail Page
The system shall provide a request detail page that:
- displays current lifecycle status prominently,
- supports direct URL access and refresh while authorization remains valid,
- includes a status history section.

History behavior:
- history entries are displayed in chronological order,
- each entry includes timestamp and action context,
- if no history exists beyond initial request creation, a clear empty state is shown instead of a blank area.

### Audit Retrieval View
Source supports an audit view for a procurement request and event filtering but does not define visual layout. UI requirements are limited to:
- chronological display of audit history for authorized reviewers,
- support for selected procurement request scope or event-filtered retrieval,
- export initiation for the selected scope.

### Accessibility Expectations
Supported by source and applicable guidance:
- keyboard navigation across screens,
- visible focus indicators on interactive elements,
- WCAG 2.1 AA compliance,
- labels always visible,
- errors must explain what went wrong and how to fix it,
- color must not be the only means of conveying state.

## API Contract
Only source-supported API operations are included below.

### Authentication APIs
1. **POST /api/auth/login**
   - Purpose: authenticate portal credentials.
   - Inputs: user credentials.
   - Success outcome: authenticated session is created; user can access protected routes.
   - Failure outcome: invalid or missing credentials are rejected.
   - Security constraints: input validation, rate limiting, CSRF protection, encrypted transport, auth event audit logging.

2. **POST /api/auth/logout**
   - Purpose: end authenticated session.

3. **GET /api/auth/session**
   - Purpose: validate active session and preserve authenticated access across refresh/navigation.
   - Performance target: under 500 ms.

4. **GET /api/portal/me**
   - Purpose: return current portal user context needed for protected experience and route authorization behavior.

### Navigation APIs
1. **GET /api/portal/navigation**
   - Purpose: retrieve navigation configuration for authorized routes.
   - Behavior: must not expose unauthorized routes.
   - Performance target: navigation config loads within 500 ms.

2. **GET /api/portal/routes/{routeKey}**
   - Purpose: retrieve route metadata for portal routing and page hierarchy behavior.
   - Security: sanitize parameters and avoid exposing hidden routes.

### Procurement Request APIs
1. **POST /api/procurement/requests**
   - Purpose: create a procurement request.
   - Inputs: required baseline procurement information.
   - Success outcome: returns a unique request identifier and initial lifecycle status.
   - Failure outcome: missing required baseline fields prevent creation and return field-level validation errors.
   - Idempotency: must prevent duplicate request records from repeated save attempts or retry after transient client interruption.
   - Security: authentication, authorization checks for creation permissions, input sanitization, CSRF protection, audit logging.
   - Performance target: under 2 seconds under normal load.

2. **PATCH /api/procurement/requests/{requestId}/draft**
   - Purpose: save progress as draft.
   - Success outcome: same procurement request can be resumed later without data loss.
   - Audit: draft-save event must be recorded.
   - Idempotency: repeated requests must not create duplicates.
   - Performance target: under 2 seconds under normal load.

3. **GET /api/procurement/requests/{requestId}**
   - Purpose: retrieve procurement request detail.
   - Success outcome: returns request detail including current lifecycle status for authorized user.
   - Security: requestId existence validation and server-side authorization enforcement; must prevent unauthorized viewing and identifier enumeration.
   - Route behavior: supports direct URL entry and refresh for authorized users.
   - Performance target: detail load under 2 seconds.

4. **GET /api/procurement/requests/{requestId}/history**
   - Purpose: retrieve procurement request status history.
   - Success outcome: returns chronological history with timestamps and action context.
   - Empty-state behavior: if no history exists beyond initial creation, response must support clear empty-state rendering.
   - Security: must block unauthorized access and avoid exposing request information for restricted identifiers.
   - Performance target: history load under 2 seconds for standard volumes; pagination or lazy loading may be used for large histories.

5. **POST /api/procurement/requests/{requestId}/status**
   - Purpose: request a lifecycle status change.
   - Validation: every requested status change must be checked against configured allowed transitions before update.
   - Success outcome: request status updated when transition is valid.
   - Failure outcome: undefined or invalid transitions are blocked and must return a clear message indicating the requested lifecycle move is not allowed.
   - Audit: both successful and rejected transition attempts must be recorded.
   - Concurrency: consistent state application under concurrent attempts using optimistic locking or equivalent concurrency control.

### Audit APIs
1. **GET /api/audit/procurement/{requestId}**
   - Purpose: retrieve audit history for a selected procurement request.
   - Output: chronological audit entries for authorized reviewers only.
   - Security: unauthorized users cannot view audit records.
   - Performance target: under 2 seconds for standard volumes.

2. **GET /api/audit/events?type=**
   - Purpose: retrieve audit events by selected event filter.
   - Security: authorized reviewers only; filter inputs sanitized.

3. **POST /api/audit/exports**
   - Purpose: export audit results in a reviewable format matching selected scope.
   - Success outcome: export generated for selected filters or request scope.
   - Audit: export request itself must be logged as a separate audit event.
   - Security: authorized reviewers only.

### Workflow Configuration APIs
1. **GET /api/config/workflow/states**
   - Purpose: read configured procurement lifecycle states and display labels.

2. **POST /api/config/workflow/states**
   - Purpose: create or update lifecycle state definitions in configuration.
   - Security: restricted to authorized roles.
   - Audit: configuration changes must be logged.

3. **POST /api/config/workflow/transitions**
   - Purpose: create or update allowed transitions.
   - Security: restricted to authorized roles.
   - Validation: configuration must preserve referential integrity.
   - Audit: configuration changes must be logged.

## Business Logic & Rules
1. The procurement portal is the primary web-based solution for procurement lifecycle users within this feature scope.
2. Protected portal functions require authentication.
3. Authenticated access must persist across standard navigation and browser refresh until the session expires or the user signs out.
4. Expired or invalid sessions must redirect the user to sign-in and display a clear message.
5. Portal navigation must be persistent on portal pages.
6. Breadcrumbs are required on multi-level pages.
7. Unauthorized routes must be hidden from navigation and blocked on direct access.
8. Procurement request creation requires baseline required information; missing required information blocks creation.
9. Procurement request creation returns a unique request identifier and an initial lifecycle status.
10. Users must be able to save request progress as a draft and resume later without losing saved information.
11. Save and retry behaviors must be idempotent enough to prevent duplicate request records from repeated clicks or transient client interruption.
12. Request detail must show the current lifecycle status for authorized users.
13. Status history must be shown in chronological order with timestamps and action context for each recorded change.
14. When no history exists beyond initial request creation, the UI must show a clear empty state rather than a blank history area.
15. Authorized users must retain access to the same request detail page after browser refresh or direct URL entry.
16. Unauthorized access to request detail and history must be blocked without exposing request information for restricted identifiers.
17. The system must create audit entries for tracked actions including request creation, draft save, status change, and authentication events.
18. Each audit entry must include mandatory metadata: actor identifier, timestamp, action type, target item identifier, and outcome.
19. Successful and rejected lifecycle transition attempts must both be audited.
20. Audit records are immutable in practice for this feature: unauthorized users may not view, modify, or delete them, and retrieval/export must not alter stored records.
21. Authorized reviewers can retrieve audit history in chronological order for a selected procurement request or event filter.
22. Audit export must match the selected retrieval scope and must itself be logged as a separate audit event.
23. Lifecycle states and allowed transitions must be stored in configuration rather than hardcoded assumptions.
24. Every procurement status change must be validated against configured allowed transitions before request update.
25. Undefined or invalid transitions must be blocked with a clear error message.
26. Workflow configuration changes must be restricted to authorized roles.
27. Approval-specific routes and conditions remain TBD and must not be hardcoded beyond configurable placeholders supported by source.

## Data Model & Validation
Only source-supported entities, fields, and constraints are included.

### Source-Supported Data Entities / Stores
- `users`
- `user_sessions`
- `procurement_requests`
- `procurement_request_status_history`
- `procurement_request_audit`
- `request_assignment` / `user_assignments`
- `audit_log`
- `auth_audit_logs`
- `export_audit_logs`
- `navigation_config`
- `route_permissions`
- `user_role_assignments`
- `workflow_state_definitions`
- `workflow_state_transitions`

### Required Data Elements Explicitly Supported by Source
#### Procurement Request
- request identifier
- current lifecycle status
- draft state/progress sufficient to resume later
- required baseline information fields (specific fields not defined in source)

#### Status History Entry
- request identifier linkage
- timestamp
- action context
- chronological ordering data
- previous state and requested/new state where applicable to transition tracking

#### Audit Entry
Mandatory metadata:
- actor identifier
- timestamp
- action type
- target item identifier
- outcome

Additionally supported where applicable:
- previous value
- new value
- request identifier
- previous state
- requested state

#### Workflow Configuration
- lifecycle state definitions
- allowed transitions
- display labels for configured states

### Validation Rules
- Visible labels are required for input fields.
- Related form fields must be logically grouped.
- Required baseline procurement fields must be validated on both frontend and backend.
- Missing or invalid fields must return inline or field-level messages identifying what must be completed or corrected.
- `requestId` must be validated for existence before returning request detail/history.
- Authorization must be enforced server-side for request detail, request history, route access, audit retrieval/export, and configuration access.
- Undefined lifecycle transitions must be rejected.
- Transition configuration must preserve referential integrity.
- Filter inputs for audit retrieval/export and route parameters must be sanitized.
- Audit entries are required for tracked events.
- Duplicate request records must be prevented during repeated save attempts or client retries.

### Data Quality and Retention Notes
- Audit records must remain unchanged after retrieval or export.
- Archive management and change history are referenced in Golden Repo guidance, but retention duration and archival policy are not specified in source.

## Functional Requirements
FR-1. The system shall provide a web sign-in page with visible field labels, keyboard-accessible controls, and a single primary action button.

FR-2. The system shall authenticate valid portal credentials and redirect the authenticated user to the procurement portal landing page with an active session.

FR-3. The system shall reject invalid or missing credentials, prevent access to protected portal routes, and display inline error messages describing what must be corrected.

FR-4. The system shall preserve authenticated access across browser refresh and standard portal navigation until session expiry or logout.

FR-5. The system shall redirect users with expired or invalid sessions to the sign-in page and display a clear session-invalid message.

FR-6. The system shall display persistent primary navigation on procurement portal pages and visually highlight the active section.

FR-7. The system shall display breadcrumbs on multi-level procurement pages to show current location and allow navigation through page hierarchy.

FR-8. The system shall support direct URL entry, browser refresh, and browser back-forward actions without losing authorized route context or breaking the page.

FR-9. The system shall hide unauthorized procurement routes from navigation menus and block direct access attempts to those routes on the server side.

FR-10. The system shall keep navigation visible during loading, empty, and recoverable error states.

FR-11. The system shall provide a procurement request form with visible labels, logically grouped fields, and inline validation.

FR-12. The system shall create a procurement request when all required baseline information is submitted and shall return a unique request identifier and an initial lifecycle status.

FR-13. The system shall prevent procurement request creation when required baseline fields are missing and shall display field-level validation messages identifying what must be completed.

FR-14. The system shall allow a user to save procurement request progress as a draft and resume the same request later without loss of previously saved information.

FR-15. The system shall prevent duplicate procurement request records when the user clicks save multiple times or retries after transient client interruption.

FR-16. The system shall record request creation and draft-save events in the audit trail with actor, timestamp, request identifier, and action outcome.

FR-17. The system shall display the current lifecycle status on the procurement request detail page for an authorized user.

FR-18. The system shall display procurement request status history in chronological order with timestamps and action context for each recorded change.

FR-19. The system shall display a clear empty state when no history exists beyond initial request creation.

FR-20. The system shall preserve access to the same authorized procurement request detail page after browser refresh or direct URL entry.

FR-21. The system shall block unauthorized access to procurement request detail and history endpoints and shall not expose request information for restricted identifiers.

FR-22. The system shall create audit entries for tracked portal actions including request creation, draft save, status change, and authentication events.

FR-23. The system shall store each audit entry with actor identifier, timestamp, action type, target item identifier, and outcome.

FR-24. The system shall allow authorized reviewers to retrieve procurement audit history in chronological order for a selected procurement request or event filter.

FR-25. The system shall export audit results in a reviewable format that matches the selected scope and shall log the export request as a separate audit event.

FR-26. The system shall prevent unauthorized users from viewing, modifying, or deleting procurement audit records.

FR-27. The system shall store procurement lifecycle states and allowed transitions in configuration readable by the portal and workflow behavior.

FR-28. The system shall validate every procurement status change against the configured allowed transitions before updating the request record.

FR-29. The system shall block undefined or invalid transitions and return a clear message indicating that the requested lifecycle move is not allowed.

FR-30. The system shall record successful and rejected transition attempts in the audit trail with request identifier, previous state, requested state, actor, timestamp, and outcome.

FR-31. The system shall restrict workflow configuration changes to authorized roles and block non-authorized access to configuration endpoints.

FR-32. The system shall enforce client-side and server-side validation for procurement request entry.

FR-33. The system shall provide loading indicators for asynchronous sign-in, request save, request retrieval, history retrieval, and other supported async portal actions.

FR-34. The system shall implement server-side authorization enforcement for protected routes and supported APIs even when the UI hides unauthorized routes.

FR-35. The system shall use configuration-driven lifecycle display labels in portal status rendering where lifecycle state labels are shown.

## Non-Functional Requirements
### Performance
- Valid sign-in operations should complete within 2 seconds for 95% of requests.
- Session checks should complete within 500 ms.
- Navigation configuration should load within 500 ms.
- Authorized route transitions should complete within 2 seconds for 95% of requests.
- Procurement request save operations should complete within 2 seconds for 95% of requests under normal load.
- Procurement request detail and history retrieval should complete within 2 seconds for 95% of requests for standard volumes.
- Lifecycle transition validation should complete within 500 ms.
- Audit retrieval should complete within 2 seconds for 95% of requests for standard volumes.
- The implementation should support pagination or lazy loading for large histories where needed.
- Applicable Golden Repo quality gate: response time under 2 seconds and ability to handle 10× load via performance testing.

### Accessibility
- UI must comply with WCAG 2.1 AA.
- Keyboard navigation must work across supported screens.
- Interactive elements must have visible focus indicators.
- Labels must always be visible.
- Error messaging must explain what went wrong and how to fix it.
- Visual state indication must not rely on color alone.

### Security
- Authentication and authorization are required for protected portal functionality.
- Use simple portal authentication only; do not assume enterprise SSO or MFA.
- Transport must be encrypted.
- Data at rest should be encrypted where supported by platform standards for audit-related data, per source technical considerations.
- CSRF protection is required for relevant state-changing operations.
- Input sanitization is required for credentials, route parameters, configuration inputs, and audit filters.
- Rate limiting is required on the login endpoint.
- Security must prevent unauthorized route discovery and request identifier enumeration.
- Audit records must be protected against unauthorized viewing, modification, or deletion.
- Production-ready milestone requires security scan completion with no high or critical findings, per applicable Golden Repo guidance.

### Reliability and Data Integrity
- Save and retry flows must prevent duplicate procurement requests.
- Draft data must persist so the same request can be resumed later without loss.
- Authorized refresh and direct-link access must restore the same route and request context.
- Concurrent status update attempts must maintain consistent state application using optimistic locking or equivalent concurrency control.
- Audit ingestion failures should be monitored.

### Observability and Operations
- Monitoring must cover system metrics, performance monitoring, log management, and alert configuration.
- Monitoring must include authentication, request save, request retrieval, history retrieval, transition validation, and audit ingestion/retrieval flows relevant to this feature.
- Log management and audit capabilities must align with retrieved architecture and governance guidance.
- Performance monitoring is required as part of stabilization expectations from applicable Golden Repo guidance.

### Quality and Delivery Gates
- Code review completed.
- Unit tests passed.
- Integration tests passed.
- Performance benchmarks met.
- Security standards met.
- Data integrity verified.
- Business process validated.
- User acceptance confirmed.
- Applicable Golden Repo guidance calls for automated test coverage greater than 90%; applicability to this feature bundle should be confirmed as a delivery gate.

## Acceptance Scenarios
### Authentication
**Scenario 1: Successful sign-in**
- Given a user is on the procurement portal sign-in page
- When the user enters valid credentials and submits
- Then the system authenticates the user
- And creates an active session
- And redirects the user to the procurement portal landing page

**Scenario 2: Invalid sign-in**
- Given a user is on the sign-in page
- When the user submits invalid or missing credentials
- Then the system rejects authentication
- And keeps protected procurement portal routes inaccessible
- And displays inline error messages describing what must be corrected

**Scenario 3: Session expiry**
- Given a user previously had an authenticated session
- When the session becomes expired or invalid
- Then the system redirects the user to the sign-in page
- And displays a clear message that the session is no longer valid

### Navigation
**Scenario 4: Persistent navigation and active section**
- Given an authenticated user is viewing a portal page
- When the page loads
- Then the system displays persistent primary navigation
- And visually highlights the active section

**Scenario 5: Breadcrumbs on multi-level page**
- Given an authenticated user navigates to a multi-level procurement page
- When the page renders
- Then the system shows breadcrumbs reflecting the page hierarchy
- And the user can use them to navigate back through the hierarchy

**Scenario 6: Authorized direct URL and refresh**
- Given an authenticated and authorized user has a valid direct URL to a portal route
- When the user opens the URL directly or refreshes the browser
- Then the system restores the same authorized route context
- And the page does not break

**Scenario 7: Unauthorized route access**
- Given a user is not authorized for a procurement route
- When the portal navigation is rendered
- Then the route is not shown in the navigation menu
- When the user attempts direct access to that route
- Then the server blocks access

### Request creation and drafts
**Scenario 8: Create request successfully**
- Given an authenticated user is on the Create Procurement Request page
- When the user submits all required baseline information
- Then the system creates a procurement request
- And returns a unique request identifier
- And assigns an initial lifecycle status
- And records a creation audit entry

**Scenario 9: Validation on missing required fields**
- Given an authenticated user is completing the procurement request form
- When the user attempts to submit with missing required baseline fields
- Then the system prevents request creation
- And displays field-level messages identifying what must be completed

**Scenario 10: Save draft and resume**
- Given an authenticated user has entered partial procurement request information
- When the user saves the request as a draft
- Then the system persists the saved progress
- And records a draft-save audit entry
- When the user returns later to the same request
- Then the previously saved information is available for resume without loss

**Scenario 11: Duplicate save protection**
- Given an authenticated user submits a create or draft-save action
- When the user clicks save multiple times or retries after a transient client interruption
- Then the system does not create duplicate procurement request records

### Request detail and history
**Scenario 12: View current status and history**
- Given an authenticated user is authorized to view a saved procurement request
- When the user opens the request detail page
- Then the system displays the current lifecycle status prominently
- And provides status history in chronological order
- And each history item includes a timestamp and action context

**Scenario 13: Empty history state**
- Given an authenticated user is viewing a saved procurement request
- And no history exists beyond initial request creation
- When the user opens the history section
- Then the system displays a clear empty state
- And does not leave the history area blank

**Scenario 14: Refresh or direct URL to request detail**
- Given an authenticated user is authorized for a procurement request
- When the user refreshes the request detail page or enters its direct URL
- Then the system restores the same request detail page
- And displays the current status and available history

**Scenario 15: Unauthorized request detail access**
- Given a user is not authorized to view a procurement request
- When the user attempts to access the request detail or history endpoint
- Then the system blocks access
- And does not expose request information for the restricted identifier

### Audit trail
**Scenario 16: Audit entry creation for tracked actions**
- Given a tracked portal action occurs
- When the action is completed or rejected
- Then the system creates an audit entry
- And stores actor identifier, timestamp, action type, target item identifier, and outcome

**Scenario 17: Retrieve audit history**
- Given an authorized reviewer selects a procurement request or event filter
- When the reviewer requests audit history
- Then the system returns audit entries in chronological order

**Scenario 18: Export audit history**
- Given an authorized reviewer has selected audit history scope
- When the reviewer requests export
- Then the system exports results in a reviewable format matching the selected scope
- And logs the export request as a separate audit event

**Scenario 19: Unauthorized audit access**
- Given a user is not authorized to access procurement audit records
- When the user attempts to view, modify, delete, or export audit records
- Then the system blocks the action

### Lifecycle configuration and transitions
**Scenario 20: Valid configured transition**
- Given lifecycle states and allowed transitions are configured
- And an authorized actor requests a status change for a procurement request
- When the requested transition is defined as allowed
- Then the system updates the request to the new lifecycle state
- And records the transition in status history
- And records a successful transition audit entry

**Scenario 21: Invalid configured transition**
- Given lifecycle states and allowed transitions are configured
- And an actor requests a status change for a procurement request
- When the requested transition is not defined as allowed
- Then the system blocks the transition
- And returns a clear message that the lifecycle move is not allowed
- And records a rejected transition audit entry including previous state, requested state, actor, timestamp, and outcome

**Scenario 22: Unauthorized configuration access**
- Given a user is not in an authorized role for workflow configuration
- When the user attempts to access or change workflow configuration endpoints
- Then the system blocks access

## Traceability Matrix
| Source ID | Requirement | Acceptance Criteria | Test Coverage |
|---|---|---|---|
| Feature 56695 | FR-1, FR-2, FR-6, FR-10, FR-22, FR-27 | Portal foundation must be usable, secure, traceable, supportable, and web-based within monolith scope | UI auth tests, navigation tests, audit tests, config tests |
| US 56699 AC1 | FR-1 | Sign-in page has visible labels, keyboard-accessible controls, single primary action | Accessibility UI test, screen rendering test |
| US 56699 AC2 | FR-2 | Valid credentials authenticate and redirect to landing page with active session | Auth integration test |
| US 56699 AC3 | FR-3 | Invalid/missing credentials rejected; protected routes blocked; inline errors shown | Negative auth test, route guard test |
| US 56699 AC4 | FR-4 | Authenticated access preserved across refresh and navigation until expiry or sign-out | Session persistence test |
| US 56699 AC5 | FR-5 | Expired/invalid session redirects to sign-in with clear message | Session expiry test |
| US 56708 AC1 | FR-6 | Persistent primary navigation and active-section highlight shown consistently | UI navigation test |
| US 56708 AC2 | FR-7 | Breadcrumbs shown on multi-level pages | Breadcrumb rendering test |
| US 56708 AC3 | FR-8 | Direct URL, refresh, and back-forward preserve authorized route context | Routing behavior test |
| US 56708 AC4 | FR-9, FR-34 | Unauthorized routes hidden in menus and blocked server-side | Authorization UI/API test |
| US 56708 AC5 | FR-10 | Navigation remains visible during loading, empty, and recoverable error states | UI state test |
| US 56717 AC1 | FR-11, FR-32 | Request form has visible labels, grouped fields, inline validation | Form rendering and validation test |
| US 56717 AC2 | FR-12 | Valid submission creates request with unique identifier and initial lifecycle status | Create request API/integration test |
| US 56717 AC3 | FR-13 | Missing required fields prevent creation and show field-level messages | Negative form/API validation test |
| US 56717 AC4 | FR-14 | Draft save and later resume preserve saved information | Draft persistence test |
| US 56717 AC5 | FR-15 | Multiple saves/retries do not create duplicate request records | Idempotency/concurrency test |
| US 56717 AC6 | FR-16, FR-22, FR-23 | Creation and draft-save events recorded in audit trail with required metadata | Audit creation test |
| US 56726 AC1 | FR-17 | Current lifecycle status displayed on request detail for authorized user | Request detail UI/API test |
| US 56726 AC2 | FR-18 | Status history shown in chronological order with timestamps and action context | History retrieval/rendering test |
| US 56726 AC3 | FR-19 | Clear empty state shown when no history beyond creation exists | Empty-state UI test |
| US 56726 AC4 | FR-20 | Same request detail page preserved after refresh or direct URL entry for authorized user | Deep-link/refresh test |
| US 56726 AC5 | FR-21 | Unauthorized access to detail/history blocked without exposing request information | Authorization and enumeration test |
| US 56742 AC1 | FR-22 | Audit entries created for request creation, draft save, status change, and authentication events | Audit event coverage test |
| US 56742 AC2 | FR-23 | Audit entries store actor identifier, timestamp, action type, target item identifier, and outcome | Audit schema/content test |
| US 56742 AC3 | FR-24 | Authorized reviewers retrieve chronological audit history by request or event filter | Audit retrieval test |
| US 56742 AC4 | FR-25 | Audit exports match selected scope and export action is separately audited | Audit export test |
| US 56742 AC5 | FR-26 | Unauthorized users cannot view, modify, or delete audit records | Audit authorization test |
| US 56735 AC1 | FR-27, FR-35 | Lifecycle states and transitions stored in configuration readable by portal/workflow behavior | Config retrieval and rendering test |
| US 56735 AC2 | FR-28 | Every status change validated against configured allowed transitions | Transition validation test |
| US 56735 AC3 | FR-29 | Invalid transitions blocked with clear message | Negative transition test |
| US 56735 AC4 | FR-30 | Successful and rejected transitions audited with required transition metadata | Transition audit test |
| US 56735 AC5 | FR-31 | Workflow configuration changes restricted to authorized roles; unauthorized access blocked | Config authorization test |

## Open Questions
1. What are the exact baseline procurement request fields required for creation and draft save?
2. What is the exact initial lifecycle status value for a newly created request, and is draft a lifecycle status, a persistence state, or both?
3. What are the approved lifecycle state values, display labels, and transition definitions for initial implementation?
4. Which specific actor types are authorized to perform status changes on procurement requests?
5. Which specific roles are authorized reviewers for audit retrieval and export?
6. Which exact roles are authorized to manage workflow state and transition configuration?
7. What procurement portal landing-page sections are required in the initial release?
8. Is there a request list page in scope for this feature, or only direct-link and detail-page retrieval behavior?
9. Should access to procurement request detail pages themselves be audited, and if so under what conditions? Source says this “may” be required.
10. What reviewable export format is required for audit exports?
11. What exact error message copy should be used for invalid credentials, expired session, unauthorized access, and invalid lifecycle transitions?
12. What response semantics should be used for unauthorized or restricted request identifiers to avoid enumeration while still supporting user feedback?
13. How should draft ownership and edit permissions behave when more than one authorized user may access the same procurement request?
14. Are concurrent sessions for the same user fully allowed, and are there any limits or session revocation rules?
15. What is the retention duration, archival policy, and purge policy for audit records, status history, drafts, and sessions?
16. Are configuration changes managed through UI, API only, or operational configuration tooling?
17. Should workflow configuration changes support versioning/rollback, or only current active configuration?
18. For large status histories and audit result sets, what are the approved pagination defaults, limits, and export size limits?
19. What specific recoverable error states must be handled in navigation, request detail, and history views?
20. Golden Repo guidance references quality gates such as >90% automated test coverage and 10× load handling; confirm whether both are mandatory release gates for this feature.

## Source References
- Feature 56695 — Procurement Portal Lifecycle Foundation
- Feature Reference 56695
- User Story US 56696 — Procurement Portal Access and Navigation
- User Story US 56699 — As a Procurement Portal User, I want to sign in to the procurement portal so that I can securely access procurement lifecycle functions
- User Story US 56708 — As a Procurement Portal User, I want to navigate the procurement portal through clear menus and breadcrumbs so that I can reach procurement lifecycle areas efficiently
- User Story US 56717 — As a Procurement Portal User, I want to create and save a procurement lifecycle request so that my procurement work can begin within the portal
- User Story US 56726 — As a Procurement Portal User, I want to view procurement lifecycle status and history so that I can track the progress of my procurement work
- User Story US 56735 — As a Procurement Process Owner, I want procurement lifecycle states and transitions to be configurable so that the portal can support the approved process scope without hardcoded assumptions
- User Story US 56742 — As a Procurement Compliance Analyst, I want an audit trail of procurement portal activity so that procurement lifecycle actions remain traceable and reviewable
- Golden Repo references cited as applicable guidance:
  - `guidelines.txt`
  - `architecture.md`
  - `governance.md`
  - `bugs_defect_guideline.md`
  - `epic_guideline.md`
  - `retail-risk-assessment.md`