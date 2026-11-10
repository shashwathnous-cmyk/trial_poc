# Feature: As Sales Representative, I want to view quote summary to achieve confirmation before submission
Status: NEW
Owner: Astra
Last Updated: 2026-10-13

## Summary
This feature adds a quote summary step that allows a Sales Representative to review quote details before final submission. The business problem is that quotes are currently submitted without a dedicated confirmation view, increasing the risk of errors. The expected outcome is a summary view that presents all selected products, quantities, and total amount so the user can confirm accuracy, edit the quote, remove items, proceed to submission, or cancel before the quote is finalized.

## Scope
In scope:
- Displaying a quote summary after the user submits quote details from the quote generation flow.
- Showing all selected products and their quantities in the summary.
- Showing the total amount in the summary.
- Allowing the user to edit quantities from the summary.
- Allowing the user to remove items from the summary.
- Allowing the user to proceed to submit the quote from the summary.
- Allowing the user to cancel from the summary.
- Retrieving quote summary data from temporary storage before submission.
- Retrieving the summary through `GET /api/quotes/summary`.
- Enforcing validation that all products are confirmed before finalizing.
- Meeting the stated performance expectation that the summary loads within 2 seconds.
- Preserving data integrity during summary display.

Out of scope:
- Final approval processes for quotes.

## Application Type & Platform Context
Application type: Mixed.

Source evidence:
- UI evidence: “User navigates to the quote generation page.”
- API evidence: “GET /api/quotes/summary for retrieving the summary.”

Platform details beyond a page-based user flow and an API are not specified.

## Actors and Permissions
Actor:
- Sales Representative

Supported permissions and access constraints from source:
- The Sales Representative can navigate to the quote generation page.
- The Sales Representative can review the quote summary.
- The Sales Representative can edit quantities in the summary.
- The Sales Representative can remove items from the summary.
- The Sales Representative can proceed to submit the quote.
- The Sales Representative can cancel the quote flow.

Open permission gap:
- The source does not define whether other roles can access the summary or whether access is restricted to the quote creator.

## Feature Development Intent
This is feature-development work to introduce a new confirmation step in the quote creation flow. The required behavior is to display a summary of quote details after the user submits quote selections and before the quote is finalized. The delivered outcome must let the Sales Representative verify selected products, quantities, and total amount, and make corrections by editing quantities or removing items before proceeding.

## UI Design & Interaction Contract
Source-supported UI and interaction behavior:
- The user starts from the quote generation page.
- The user selects products and quantities.
- The user submits the quote.
- The system then displays a summary of the quote.
- The user reviews the summary.
- The user can confirm or edit the quote.
- The user can remove items from the summary.
- The user can proceed to submit or cancel the quote.

Required summary content:
- All selected products.
- Quantities for all selected products.
- Total amount.

Required interaction capabilities:
- Edit quantities from the summary.
- Remove items from the summary.
- Proceed to submit.
- Cancel.

Validation behavior supported by source:
- All products must be confirmed before finalizing.

UI details not supported by source:
- Specific page layout, component types, button labels, confirmation dialogs, empty states, loading states, error copy, inline validation copy, and navigation behavior after cancel or edit are not specified.

Accessibility expectations:
- No explicit accessibility requirements are provided in the source.

## API Contract
Supported API operation:
- `GET /api/quotes/summary`

Purpose:
- Retrieve the quote summary for review before submission.

Source-supported behavior:
- The summary data is retrieved from temporary storage of quote details before submission.
- The API supports display of selected products, quantities, and total amount.

Inputs:
- Validate: the source does not specify request parameters, path parameters, query parameters, headers, authentication mechanism, or quote identifier used to retrieve the summary.

Outputs:
- Must support returning data needed to display:
  - Selected products
  - Quantities
  - Total amount

Errors:
- Not specified in source.

Permissions/security:
- Data integrity during the display of summary must be ensured.

Idempotency:
- `GET /api/quotes/summary` is read-only by HTTP method semantics, but no explicit idempotency statement is present in source.

Integration behavior:
- Reads quote details from temporary storage before final submission.

Unsupported API details to confirm:
- No source-supported endpoints are provided for edit, remove, confirm, cancel, or final submission actions.

## Business Logic & Rules
- The summary is displayed after the user submits the quote details from the quote generation flow and before finalization.
- The summary must display all selected products and their quantities correctly.
- The total amount must be accurately calculated and displayed in the summary.
- The user may edit quantities from the summary.
- The user may remove items from the summary.
- The user may proceed to submit or cancel from the summary.
- All products must be confirmed before finalizing.
- Quote details used for the summary are sourced from temporary storage before submission.
- Data integrity must be maintained during summary display.
- Final approval processes are excluded from this feature.

Business rules not fully defined by source:
- What action constitutes product confirmation.
- Whether total amount updates immediately after edit/remove or only after refresh.
- Whether zero quantity is allowed when editing, or must be handled as item removal.
- Whether cancel discards temporary quote details or simply exits the summary.

## Data Model & Validation
Source-supported data elements:
- Quote details
- Selected products
- Quantities
- Total amount

Data source:
- Temporary storage of quote details before submission

Validation rules:
- All products must be confirmed before finalizing.
- Selected products and quantities shown in the summary must be correct.
- Total amount shown in the summary must be accurate.

Data model gaps:
- Product identifiers, product names, pricing fields, currency, subtotal structure, quote identifier, and confirmation flags are not specified.
- Retention period and cleanup behavior for temporary storage are not specified.
- Data-quality handling for missing, stale, or corrupted temporary quote details is not specified.

## Functional Requirements
FR-1. The system shall display a quote summary after the Sales Representative submits quote details from the quote generation flow and before the quote is finalized.

FR-2. The system shall retrieve quote summary data using `GET /api/quotes/summary`.

FR-3. The system shall source quote summary data from temporary storage of quote details before submission.

FR-4. The system shall display all selected products in the summary.

FR-5. The system shall display the quantity for each selected product in the summary.

FR-6. The system shall display selected products and quantities correctly in the summary.

FR-7. The system shall calculate and display the total amount accurately in the summary.

FR-8. The system shall allow the Sales Representative to edit quantities from the summary.

FR-9. The system shall allow the Sales Representative to remove items from the summary.

FR-10. The system shall allow the Sales Representative to proceed to submit the quote from the summary.

FR-11. The system shall allow the Sales Representative to cancel from the summary.

FR-12. The system shall require all products to be confirmed before finalizing the quote.

FR-13. The system shall preserve data integrity while displaying the summary.

FR-14. The system shall exclude final approval processing from this feature.

FR-15. The system shall make the summary available within 2 seconds of the request.

## Non-Functional Requirements
- Performance: The quote summary should load within 2 seconds.
- Security: The system must ensure data integrity during the display of the summary.
- Reliability: The summary must correctly reflect quote details stored in temporary storage before submission.

No additional source-supported requirements are provided for:
- Availability
- Audit logging
- Monitoring/observability
- Accessibility conformance level
- Compliance standards
- Browser/device support

## Acceptance Scenarios
### Scenario 1: Display summary with selected products and quantities
Given a Sales Representative has selected products and quantities in the quote generation flow  
When the user submits the quote details for review  
Then the system displays a quote summary before finalization  
And the summary shows all selected products  
And the summary shows the correct quantity for each selected product

### Scenario 2: Display accurate total amount
Given a Sales Representative has selected products and quantities for a quote  
When the quote summary is displayed  
Then the system shows the total amount for the quote  
And the total amount is accurately calculated from the quote details in temporary storage

### Scenario 3: Edit quantities in the summary
Given a quote summary is displayed  
When the Sales Representative edits the quantity of an item  
Then the system applies the updated quantity to the quote summary  
And the summary reflects the updated quote details for review before finalization

### Scenario 4: Remove an item from the summary
Given a quote summary is displayed with one or more items  
When the Sales Representative removes an item from the summary  
Then the removed item is no longer shown in the summary  
And the summary reflects the updated quote details for review before finalization

### Scenario 5: Prevent finalization until all products are confirmed
Given a quote summary is displayed  
And one or more products are not confirmed  
When the Sales Representative attempts to finalize the quote  
Then the system does not finalize the quote

### Scenario 6: Proceed from summary to submission
Given a quote summary is displayed  
And all required product confirmations have been completed  
When the Sales Representative chooses to proceed  
Then the system allows the quote to continue to submission

### Scenario 7: Cancel from summary
Given a quote summary is displayed  
When the Sales Representative chooses to cancel  
Then the system cancels the quote flow from the summary step

### Scenario 8: Retrieve summary through API within performance target
Given quote details exist in temporary storage before submission  
When `GET /api/quotes/summary` is requested  
Then the system returns the data needed to display selected products, quantities, and total amount  
And the summary response is available within 2 seconds

## Traceability Matrix
| Source ID | Requirement | Acceptance Criteria | Test Coverage |
|---|---|---|---|
| Feature 21236 / US 21236 | FR-1, FR-3 | Summary view is displayed for confirmation before submission | Verify summary appears after quote submission and uses pre-submission temporary data |
| US 21236 AC1 | FR-4, FR-5, FR-6 | The summary displays all selected products and their quantities correctly | Test summary contains every selected product and correct quantity values |
| US 21236 AC2 | FR-8, FR-9 | Users can edit quantities or remove items from the summary | Test quantity editing and item removal from summary |
| US 21236 AC3 | FR-7 | The total amount is accurately calculated and displayed in the summary | Test total calculation and rendered total amount |
| Feature 21236 | FR-10 | Users can proceed to submit the quote | Test proceed action from summary |
| Feature 21236 | FR-11 | Users can cancel the quote | Test cancel action from summary |
| Feature 21236 | FR-12 | Ensure all products are confirmed before finalizing | Test finalization is blocked when products are unconfirmed and allowed when confirmed |
| Feature 21236 | FR-2 | API endpoint: GET /api/quotes/summary for retrieving the summary | Test successful retrieval of summary data through the specified endpoint |
| Feature 21236 | FR-13 | Ensure data integrity during the display of summary | Test summary reflects stored quote details without corruption during display |
| Feature 21236 | FR-15 | Summary should load within 2 seconds | Performance test for summary retrieval and display time |
| Feature 21236 | FR-14 | Final approval processes for quotes are out of scope | Verify no final approval behavior is included in this feature |

## Open Questions
1. What identifies the quote to `GET /api/quotes/summary`—session, quote ID, user context, or another identifier?
2. What is the exact response contract for `GET /api/quotes/summary`?
3. Are there separate API operations for editing quantities, removing items, confirming products, proceeding to submit, and canceling, or are these handled by existing endpoints not included in the source?
4. What specifically constitutes “product confirmation” for the rule that all products must be confirmed before finalizing?
5. What user-facing behavior should occur when the user attempts to finalize with unconfirmed products?
6. What should happen after cancel—discard temporary quote details, return to the quote generation page, or another behavior?
7. What should happen after editing quantities—stay on the summary, navigate back to quote generation, or another behavior?
8. Should total amount update immediately after edit/remove actions, and if so, by what interaction pattern?
9. What error handling is required if temporary quote details are missing, unavailable, stale, or inconsistent?
10. What authentication and authorization rules apply to access the quote summary API and UI?
11. Can a Sales Representative access only their own in-progress quote summary, or can they access summaries created by others?
12. What fields must be shown for each product besides product and quantity, if any?
13. What pricing and currency rules are used to calculate the total amount?
14. Are there any required loading, empty, or error states for the summary page?
15. Are there explicit accessibility requirements for the summary view?
16. Does the 2-second requirement apply to API response time, end-to-end page render time, or both?

## Source References
- Feature ID 21236
- Feature Reference 21236
- Feature Title: As Sales Representative, I want to view quote summary to achieve confirmation before submission
- User Story: US 21236
- User Story Acceptance Criteria:
  - Criteria 1: The summary displays all selected products and their quantities correctly.
  - Criteria 2: Users can edit quantities or remove items from the summary.
  - Criteria 3: The total amount is accurately calculated and displayed in the summary.
- Source details used:
  - Quote generation flow and summary review interaction
  - Temporary storage of quote details before submission
  - API endpoint `GET /api/quotes/summary`
  - Validation rule that all products are confirmed before finalizing
  - Security requirement for data integrity during summary display
  - Performance requirement that summary should load within 2 seconds
  - Out-of-scope statement excluding final approval processes
- Golden Repo references used:
  - None provided in source context