# Implementation Requirements Checklist

**Purpose**: Provide an implementation acceptance checklist that agents can execute one item at a time.  
**Feature**: 21245 — As Sales Representative, I want to apply discounts to quotes to achieve better pricing for customers

## Functional Acceptance Criteria

- [ ] Sales Representatives can enter a discount percentage while generating or editing a quote
- [ ] The application validates the entered discount percentage against the allowed maximum threshold from the discount rules data source and prevents submission when the threshold is exceeded
- [ ] The application recalculates the quote total after discount application and displays the updated total in real time during quote review
- [ ] The quote workflow supports reviewing the applied discount and updated pricing before quote submission
- [ ] Discount application is available only within the quote flow; custom discount negotiations outside the system are not implemented
- [ ] Primary flow is implemented: select products, enter quantities, apply discount, view recalculated total, review updated quote, submit quote
- [ ] Failure flow is implemented for invalid discount input or threshold violations with observable prevention of invalid quote submission
- [ ] Alternate flow is implemented for quotes with no discount applied, preserving normal quote submission behavior

## UI Acceptance Criteria

- [ ] The quote generation page includes a discount percentage input in the quote pricing flow where Sales Representatives apply discounts
- [ ] The UI displays the recalculated discounted total without requiring a full page refresh, consistent with the real-time update requirement
- [ ] The UI provides a clear validation message when the entered discount exceeds the allowed threshold
- [ ] The UI provides a review state showing the entered discount and updated total before final quote submission
- [ ] Discount-related fields and messages follow existing local UI conventions and design-system patterns for form input, validation, and computed totals
- [ ] The discount input and updated totals remain usable and readable across supported screen sizes where the quote page is available
- [ ] Discount entry, validation feedback, and quote review interactions are accessible through standard form semantics and keyboard interaction patterns used by the application

## API and Integration Acceptance Criteria

- [ ] The quote discount application flow uses the source-supported endpoint for applying discounts at `POST /api/quotes/apply-discount`
- [ ] The API accepts the inputs required to identify the quote and requested discount percentage and returns data needed to display the updated quote total
- [ ] The API enforces the same discount threshold validation as the UI so invalid discounts cannot be applied through direct requests
- [ ] The implementation reads applicable discount threshold rules from the discount rules database as identified in the feature source
- [ ] Error responses for invalid discount application are surfaced in a way the UI can present to the Sales Representative
- [ ] Discount application logging is integrated so each applied discount can be referenced later for audit purposes
- [ ] Access to apply discounts is restricted to authorized users in the Sales Representative quote workflow, preserving discount data integrity
- [ ] Existing quote-related API contracts remain backward-compatible unless an explicit source-supported change is required

## Business Logic and Data Acceptance Criteria

- [ ] Discount calculation logic applies the entered percentage to the quote total and produces the correct discounted total
- [ ] Discount validation logic enforces the maximum allowed discount threshold defined by the discount rules data source
- [ ] Invalid discount values are rejected according to source-supported validation, including threshold violations
- [ ] The discounted total shown to the user matches the total persisted or submitted with the quote
- [ ] Discount application data is recorded for audit/reference, including enough information to identify the quote, applied discount, and application event
- [ ] Quote review and submission preserve the applied discount and recalculated pricing without inconsistency between screens or requests
- [ ] The implementation does not add unsupported business behavior for negotiated or custom discounts outside the system-defined rules
- [ ] If the source does not define discount rounding, stacking behavior, or whether discounts apply before/after taxes or other adjustments, those cases are treated as Open Questions and must not be implemented as silent assumptions

## Non-Functional Acceptance Criteria

- [ ] Discount application updates are performant enough to support the source-supported real-time user experience on the quote page
- [ ] The implementation maintains integrity of discount data during entry, calculation, transmission, persistence, and logging
- [ ] Audit logging for discount application is reliable enough to support future reference and audit use
- [ ] Authorization and security controls prevent unauthorized discount application or tampering with discount values
- [ ] The implementation fits the selected monolith architecture style and follows existing application boundaries and patterns
- [ ] The implementation does not introduce an unrelated domain or unsupported workflow beyond quote discount application
- [ ] Tests or verification steps cover discount threshold validation, real-time total recalculation, quote review before submission, API enforcement, and audit logging

## Traceability

- [ ] Every implemented change maps back to the feature’s stated functionality, user interaction flow, technical considerations, or acceptance criteria for discount input, threshold validation, real-time total display, and audit logging
- [ ] Every non-blocking Open Question that was implemented has a recorded decision + one-line rationale in `specs/<slug>/assumptions.md` (no Open Question is silently assumed)
- [ ] No BLOCKING Open Question was implemented as an assumption; unresolved blocking details such as undefined rounding rules, tax interaction, discount stacking, or exact audit log contents must hold the feature at needs-clarification until resolved

## Notes

- Never resolve an Open Question silently. In an unattended run, record the chosen assumption + rationale in `specs/<slug>/assumptions.md`; blocking questions must instead hold the feature at needs-clarification.
- Mark an item complete only after verifying actual implementation code and behavior.