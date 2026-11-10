# Golden Repository UI/UX Design System

Generated for: HIlti
Repository: Automotive Standard
Generated at: 2026-11-02T11:13:59.410Z

## Warnings

- None

## How To Use

- Read this file before UI implementation to align with the Golden Repository design language.
- Apply these design tokens, component rules, and accessibility requirements when building UI.
- Use `golden-ui-design-sources.md` for the exact UI/design source excerpts and file-path attribution.
- Existing UI conventions in the target workspace override generic guidance when they conflict.
- Do not invent tokens, components, screens, or flows that are not defined here.
- Do not require live Golden Repository access inside the implementation workspace.

## Design System

## Components & Patterns

### Editable Content Pattern

- Enter edit mode by:
  - Clicking the pencil icon `✏️`
  - Pressing `e`
- Editing can begin anywhere in the content.
- Press `/` to open content insertion options.
  - Example slash commands:
    - `/image`
    - `/table`
- Top toolbar includes controls for:
  - Font
  - Colors
  - Formatting
- Action behavior:
  - `close` saves draft
  - `publish` shares the page

### Data Table Pattern

- Use data tables for:
  - Structured records
  - Matrices
- Table examples supported:
  - 2-column key/value tables
    - Example columns: `Score`, `Description`
  - Multi-column management tables
    - Used for risks and monitoring
  - Matrix tables
    - Example: `Impact \ Probability`

### Status and Severity Categorization

- Severity labels:
  - `Low`
  - `Medium`
  - `High`
  - `Critical`
- Score mapping:
  - `Low`: `1-5`
  - `Medium`: `6-10`
  - `High`: `11-15`
  - `Critical`: `16-25`

### Escalation Levels

- `Level 1`: Minor issues
- `Level 2`: Moderate issues
- `Level 3`: Critical issues

## Iconography & Imagery

### Action Icons

- Use the pencil icon `✏️` to represent the edit action.

## UI Naming & Structure

### Action and Command Labels

- Use explicit action labels:
  - `close`
  - `publish`

### Keyboard Shortcuts and Command Triggers

- Keyboard shortcut:
  - `e` for edit
- Slash-command trigger:
  - `/` for content insertion

### Structured UI Field and Table Naming

- Use the following field/table labels where applicable:
  - `Score`
  - `Description`
  - `Impact`
  - `Probability`
  - `Risk ID`
  - `Category`
  - `Related Epic/Feature`
  - `Related User Story/BRD Ref`
  - `Risk Statement`
  - `Probability (1-5)`
  - `Impact (1-5)`
  - `Severity`
  - `Trigger/Indicator`
  - `Mitigation Strategy`
  - `Contingency Plan`
  - `Owner Role`
  - `Review Cadence`
  - `Status`
  - `Metric/Signal`
  - `Threshold`
  - `Monitoring Frequency`
  - `Escalation Path`
  - `Tool/Source`
  - `Epic`
  - `Feature`
  - `User Story/Requirement`
  - `Acceptance Criteria Impacted`
  - `Control/Mitigation`

### Content Structure Terms

- Use the following content section terms:
  - `Cause`
  - `Impacted Scope`
  - `Mitigation Actions`
  - `Contingency`
  - `Decision Owner`
  - `Due Date`
  - `Assumptions`
  - `Dependencies`
  - `Open Decisions`