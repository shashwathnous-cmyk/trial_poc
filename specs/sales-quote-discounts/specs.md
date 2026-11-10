# Feature: As Sales Representative, I want to apply discounts to quotes to achieve better pricing for customers
Status: NEW
Owner: Astra
Last Updated: 2026-10-13

## Summary
This feature enables Sales Representatives to apply discounts to quotes using predefined discount rules so they can offer better pricing to customers in a consistent and controlled way.

The feature addresses the current problem that discounts are not systematically applied, which leads to inconsistent pricing. The expected outcome is that a Sales Representative can enter a discount percentage during quote generation, the system validates that the discount is within allowed thresholds, recalculates and displays the discounted total in real time, and logs the discount application for future reference and audits before the quote is submitted.

## Scope
### In Scope
- Allowing a Sales Representative to input a discount percentage on a quote.
- Validating entered discounts against maximum allowed thresholds.
- Using the discount rules database as the source for discount rule validation.
- Calculating the new quote total after discount application.
- Displaying the updated total in real time.
- Allowing the user to review the discount application before quote submission.
- Logging discount applications for future reference and audits.
- Supporting discount application through the identified API operation: `POST /api/quotes/apply-discount`.
- Maintaining integrity of discount data during discount application.

### Out of Scope
- Custom discount negotiations outside of the system.

## Application Type & Platform Context
This feature targets a mixed application context:
- Web or UI-based interaction is supported by the source statement: “User navigates to the quote generation page.”
- API/service interaction is supported by the source statement: `POST /api/quotes/apply-discount for applying discounts.`

Architecture context:
- User-selected architecture style: monolith.

Open Question:
- The source identifies a mixed application type, but it does not specify whether the quote generation page is web-only, mobile-enabled, or available on additional client platforms.

## Actors and Permissions
### Primary Actor
- **Sales Representative**
  - Can navigate to the quote generation page.
  - Can select products and input quantities as part of the quote flow.
  - Can input a discount percentage.
  - Can review the updated quote before submission.
  - Can submit the quote.

### Access and Permission Constraints
- Discount entry must be validated so discounts do not exceed allowed thresholds.
- The feature must maintain integrity of discount data.

Open Questions:
- The source does not specify whether all Sales Representatives can apply any discount up to the threshold, or whether permission varies by role, territory, account, quote type, or approval status.
- The source does not specify whether users other than Sales Representatives can view or apply discounts.
- The source does not specify whether audit logs are viewable by Sales Representatives, administrators, or audit users only.

## Feature Development Intent
This is feature-development work to add systematic discount application behavior to quote generation.

The feature must deliver:
- A method for Sales Representatives to enter discount percentages during quote creation.
- Validation against predefined rules sourced from the discount rules database.
- Immediate recalculation and display of discounted totals.
- Logging of discount applications for auditing and future reference.
- A review step in which the updated quote can be checked before submission.

The intended business outcome is more competitive customer pricing with consistent application of discounts based on predefined rules rather than ad hoc handling.

## UI Design & Interaction Contract
Source-supported UI behavior is limited to the quote generation flow and discount review behavior.

### Supported User Flow
1. User navigates to the quote generation page.
2. User selects products and inputs quantities.
3. User applies a discount.
4. System calculates the new total price.
5. User reviews the updated quote.
6. User submits the quote.

### UI Interaction Requirements
- The quote generation page must allow the user to input a discount percentage.
- After a discount is applied, the system must display the new total after discount application in real time.
- The user must be able to review the updated quote before submission.
- Validation must prevent entry or application of discounts that exceed maximum allowed thresholds.

### UI States Supported by Source
- Initial quote generation state with product and quantity selection.
- Discount entry state.
- Updated quote review state with recalculated total.
- Validation failure state when a discount exceeds the maximum threshold.

### Validation and Messaging
- The source requires validation preventing discounts from exceeding allowed thresholds.
- Specific field-level validation message text, inline error placement, warning copy, and review page layout are not specified.

### Accessibility Expectations
Open Question:
- The source does not define accessibility requirements, assistive technology behavior, keyboard interaction, visual contrast, focus handling, or error announcement expectations for the discount entry and quote review experience.

## API Contract
### Supported Operation
- `POST /api/quotes/apply-discount`

### Purpose
Applies a discount to a quote so the discounted total can be calculated and returned or otherwise reflected in the quote flow.

### Source-Supported Inputs
- Discount percentage.
- Quote context sufficient to apply the discount to the selected products and quantities.

### Source-Supported Processing Requirements
- Validate the requested discount against allowed thresholds.
- Use the discount rules database as the source of applicable discount rules.
- Maintain integrity of discount data.
- Reflect the discount application result in real time.

### Source-Supported Outputs
- New total after discount application.

### Error Conditions
- Discount exceeds allowed threshold.

### Security
- Maintain integrity of discount data.

### Idempotency and Integration Behavior
Open Questions:
- The request schema for `POST /api/quotes/apply-discount` is not specified.
- The response schema is not specified.
- It is not specified whether the endpoint persists the discount immediately, performs preview-only calculation, or both.
- It is not specified whether repeated identical requests must be treated idempotently.
- Authentication and authorization requirements for the endpoint are not specified.
- The exact discount rules lookup behavior from the discount rules database is not specified.
- Error response format and status codes are not specified.

## Business Logic & Rules
- Discounts are applied to quotes to improve pricing competitiveness.
- Discount percentages are user-entered by the Sales Representative.
- Discounts must be validated against predefined rules.
- Discounts must not exceed allowed maximum thresholds.
- Discount rules are sourced from the discount rules database.
- After a valid discount is applied, the system calculates a new total price.
- The new total must be displayed in real time.
- Discount applications must be logged for future reference and audits.
- Users must be able to review the discount application before quote submission.
- Custom discount negotiations outside of the system are excluded.

Open Questions:
- The source does not specify whether the threshold is global, per product, per quote, per customer, or based on other rule dimensions.
- The source does not specify whether discounts are applied to quote subtotal, line items, or total price including taxes/fees.
- The source does not specify rounding rules for discounted totals.
- The source does not specify whether multiple discounts can be applied or only one discount percentage per quote.
- The source does not specify whether discounts can be edited or removed after application.
- The source does not specify whether quote submission is blocked when discount review has not occurred explicitly.

## Data Model & Validation
### Source-Supported Data Elements
- Quote
- Products selected on the quote
- Quantities
- Discount percentage
- New total after discount
- Discount rules from the discount rules database
- Discount application log for auditing and future reference

### Validation Rules
- Discount percentage must be validated so it does not exceed the maximum allowed threshold.
- Discount application must comply with predefined rules from the discount rules database.

### Data Integrity Requirements
- The system must maintain integrity of discount data.
- Discount applications must be logged for future reference and audits.

Open Questions:
- The source does not define the quote fields, product fields, quantity constraints, or discount log schema.
- The source does not define whether minimum discount values, negative values, zero values, or decimal precision constraints apply.
- The source does not define retention requirements for audit logs.
- The source does not define whether the original total must be stored alongside the discounted total.
- The source does not define whether discount reason, approver, timestamp, or rule identifier must be stored in the audit record.

## Functional Requirements
1. The system shall allow a Sales Representative to apply a discount percentage during the quote generation flow.
2. The system shall validate the entered discount percentage against maximum allowed thresholds before accepting the discount application.
3. The system shall use predefined rules from the discount rules database to determine whether a discount is allowed.
4. The system shall prevent application of a discount that exceeds the allowed threshold.
5. The system shall calculate a new quote total after a valid discount is applied.
6. The system shall display the new total after discount application in real time.
7. The system shall allow the user to review the updated quote before the quote is submitted.
8. The system shall log each discount application for future reference and audits.
9. The system shall support discount application through `POST /api/quotes/apply-discount`.
10. The system shall maintain integrity of discount data during discount application processing.
11. The system shall support the quote interaction flow in which the user navigates to the quote generation page, selects products, enters quantities, applies a discount, reviews the updated quote, and submits the quote.
12. The system shall exclude custom discount negotiations outside of the system from this feature.
13. The system shall return or otherwise make available an error outcome when a discount application fails validation because it exceeds the allowed threshold.
14. The system shall make discount application results available quickly enough to satisfy the requirement that the new total is reflected in real time.

## Non-Functional Requirements
- **Performance:** Discount application should be reflected in real time.
- **Security:** The system must maintain integrity of discount data.
- **Auditability:** Discount applications must be logged for future reference and audits.
- **Architecture Context:** The feature is to be implemented within a monolith architecture style.

Open Questions:
- The source does not define measurable response-time thresholds for “real-time.”
- The source does not define reliability, availability, or recovery requirements.
- The source does not define encryption, logging protections, or other specific security controls.
- The source does not define observability requirements such as operational metrics, tracing, or alerting.
- The source does not define compliance or retention obligations for audit data.

## Acceptance Scenarios
### Scenario 1: Apply a valid discount percentage to a quote
**Given** a Sales Representative is on the quote generation page  
**And** products and quantities have been selected for a quote  
**When** the Sales Representative inputs a discount percentage that is within the allowed threshold  
**Then** the system applies the discount  
**And** calculates the new total  
**And** displays the new total in real time  
**And** allows the Sales Representative to review the updated quote before submission

### Scenario 2: Prevent a discount that exceeds the maximum threshold
**Given** a Sales Representative is on the quote generation page  
**And** products and quantities have been selected for a quote  
**When** the Sales Representative inputs a discount percentage that exceeds the allowed threshold  
**Then** the system prevents the discount from being applied  
**And** indicates a validation failure for exceeding the maximum threshold  
**And** does not accept the invalid discount application

### Scenario 3: Log discount application for audit
**Given** a Sales Representative applies a valid discount to a quote  
**When** the discount is accepted by the system  
**Then** the system logs the discount application  
**And** preserves the record for future reference and audits

### Scenario 4: Review updated quote before submission
**Given** a Sales Representative has applied a valid discount  
**And** the system has recalculated the quote total  
**When** the Sales Representative reviews the updated quote  
**Then** the updated pricing reflects the applied discount  
**And** the Sales Representative can proceed to submit the quote

### Scenario 5: Apply discount through API
**Given** a valid request is made to `POST /api/quotes/apply-discount`  
**When** the submitted discount percentage is within the allowed threshold according to predefined rules  
**Then** the system applies the discount  
**And** produces the new total after discount application  
**And** logs the discount application for future reference and audits

### Scenario 6: API rejects over-threshold discount
**Given** a request is made to `POST /api/quotes/apply-discount`  
**When** the submitted discount percentage exceeds the allowed threshold  
**Then** the system rejects the discount application  
**And** returns an error outcome indicating validation failure

## Traceability Matrix
| Source ID | Requirement | Acceptance Criteria | Test Coverage |
|---|---|---|---|
| Feature 21245 / US 21245 AC1 | FR-1 Allow Sales Representative to input/apply discount percentage during quote generation | Users can input discount percentages, and validations prevent exceeding maximum thresholds | UI test for discount entry on quote generation page |
| Feature 21245 / US 21245 AC1 | FR-2 Validate discount percentage against maximum allowed thresholds | Users can input discount percentages, and validations prevent exceeding maximum thresholds | Validation test with under-threshold and at-threshold values |
| Feature 21245 / US 21245 AC1 | FR-3 Use discount rules database predefined rules to determine allowed discount | Users can input discount percentages, and validations prevent exceeding maximum thresholds | Integration test verifying rule-based threshold enforcement |
| Feature 21245 / US 21245 AC1 | FR-4 Prevent over-threshold discount application | Users can input discount percentages, and validations prevent exceeding maximum thresholds | Negative test for over-threshold discount rejection |
| Feature 21245 / US 21245 AC2 | FR-5 Calculate new total after valid discount application | The system displays the new total after discount application in real-time | Calculation test for discounted quote total |
| Feature 21245 / US 21245 AC2 | FR-6 Display updated total in real time | The system displays the new total after discount application in real-time | UI/API responsiveness test for immediate updated total visibility |
| Feature 21245 / US 21245 description | FR-7 Allow review of updated quote before submission | Supported by story description: Users can review discount application before submission | UI flow test covering review step before submit |
| Feature 21245 / US 21245 AC3 | FR-8 Log discount applications for future reference and audits | Discount applications are logged for future reference and audits | Audit log creation test after successful discount application |
| Feature 21245 / US 21245 technical considerations | FR-9 Support `POST /api/quotes/apply-discount` for discount application | Supported by technical considerations API endpoint | API contract test for discount application request |
| Feature 21245 / US 21245 technical considerations | FR-10 Maintain integrity of discount data | Supported by technical considerations security requirement | Security/integrity test ensuring discount data is not corrupted during processing |
| Feature 21245 / US 21245 user interaction flow | FR-11 Support quote flow from selection through discount, review, and submission | Supported by user interaction flow | End-to-end flow test from quote generation to submission |
| Feature 21245 / US 21245 out of scope | FR-12 Exclude custom discount negotiations outside of the system | Out of scope statement | Scope verification; no support for off-system negotiation workflow |
| Feature 21245 / US 21245 AC1 | FR-13 Return or surface validation failure when threshold is exceeded | Users can input discount percentages, and validations prevent exceeding maximum thresholds | UI/API error-path test for invalid discount |
| Feature 21245 / US 21245 technical considerations | FR-14 Reflect discount application in real time | Performance: Discount application should be reflected in real-time | Performance verification against defined implementation benchmark once clarified |

## Open Questions
1. Is the quote generation page a web page only, or must this feature also be available in mobile or other clients?
2. What exact request and response schema is required for `POST /api/quotes/apply-discount`?
3. Does `POST /api/quotes/apply-discount` perform a preview calculation only, persist the discount on the quote, or both?
4. What authentication and authorization rules apply to `POST /api/quotes/apply-discount`?
5. What are the exact allowed discount thresholds, and are they global or dependent on quote, product, customer, or other attributes?
6. How are discount rules represented in the discount rules database, and what data is required to evaluate them?
7. Is discount applied at quote level, line-item level, subtotal level, or final total level?
8. Are taxes, fees, shipping, or other price components included in the discount calculation?
9. What rounding and decimal precision rules apply to discount percentage and discounted totals?
10. Can multiple discounts be applied to a single quote, or is only one discount percentage allowed?
11. Can a previously applied discount be edited or removed before quote submission?
12. What exact UI validation message text should be shown when a discount exceeds the threshold?
13. What data fields must be recorded in the audit log for a discount application?
14. How long must discount audit records be retained?
15. Who is allowed to access or review discount audit logs?
16. What measurable service-level expectation defines “real-time” for discount recalculation and display?
17. Are there any accessibility requirements for discount entry, validation errors, and quote review states?
18. Are there approval workflows for discounts near or at threshold levels?
19. Should the system capture the original total alongside the discounted total for audit/reference purposes?
20. Are negative discounts, zero discounts, or decimal percentage values allowed?

## Source References
- Feature ID: 21245
- Feature Reference: 21245
- Feature Title: As Sales Representative, I want to apply discounts to quotes to achieve better pricing for customers
- User Story: US 21245
- Acceptance Criteria:
  - Criteria 1: Users can input discount percentages, and validations prevent exceeding maximum thresholds.
  - Criteria 2: The system displays the new total after discount application in real-time.
  - Criteria 3: Discount applications are logged for future reference and audits.
- Source details used:
  - User interaction flow: navigate to quote generation page, select products, input quantities, apply discount, calculate new total, review updated quote, submit quote
  - Technical considerations: discount rules database, threshold validation, `POST /api/quotes/apply-discount`, maintain integrity of discount data, real-time reflection
  - Out of scope: custom discount negotiations outside of the system
  - Architecture style: monolith
  - Derived application type signal: mixed