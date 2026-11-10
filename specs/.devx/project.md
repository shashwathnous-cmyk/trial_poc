# HIlti

> Auto-generated project context for AI-assisted development.
> Last updated: 2026-11-02

**Organization:** QS001

## Overview

Testing

## Development Methodology

This project follows **Spec-Driven Development (SDD)**.

Every feature has:
- `specs.md` — Full technical specification
- `requirements.md` — Implementation acceptance checklist
- `prompt.md` — Ready-to-use implementation prompt

## Features (15)

- **As Mobile User, I want to view the application in responsive layout to achieve optimal reading experience** (0 user stories)
- **As Sales Representative, I want to apply discounts to quotes to achieve better pricing for customers** (0 user stories)
- **As Security Officer, I want to implement multi-factor authentication to achieve enhanced security** (0 user stories)
- **As Mobile User, I want to view images responsively to achieve faster loading times** (0 user stories)
- **As Security Officer, I want to implement data encryption to achieve secure user information handling** (1 user stories)
- **As a user with mobility impairments, I want to navigate the system using only my keyboard to achieve an accessible experience.** (1 user stories)
- **As System Administrator, I want to implement load balancing to achieve optimal resource utilization; As System Administrator, I want to implement redundancy and failover mechanisms to achieve continuous system availability; As Sales Representative, I want to apply discounts to quotes to achieve better pricing for customers** (0 user stories)
- **Procurement Portal Lifecycle Foundation** (0 user stories)
- **As Sales Representative, I want to view quote summary to achieve confirmation before submission** (1 user stories)
- **As Shopper, I want to remove items from my shopping cart to achieve better selection of products** (1 user stories)
- **As System Administrator, I want to ensure pricing data is synchronized to achieve accurate sales information** (1 user stories)
- **As Content Manager, I want to create and edit website content to achieve timely updates** (1 user stories)
- **As System Administrator, I want to handle synchronization errors to achieve reliable operations** (1 user stories)
- **As Business Owner, I want to provide my business information to register for an account so that I can manage my business activities online.** (1 user stories)
- **As User, I want to perform a basic search to achieve relevant results quickly** (0 user stories)

## Getting Started

1. Read this file for project context
2. Check `specs/.devx/workflow.md` for the development workflow
3. Review `specs/.devx/instruction.md` for architecture and multi-repo rules
4. Pick a feature from `specs/.devx/features.json`
5. Open the feature's `prompt.md` and use it with your AI assistant
6. Follow the spec and requirements to implement

## Project Structure

```
specs/
  .devx/
    project.md          ← You are here
    workflow.md          ← Development workflow
    features.json        ← Feature index (machine-readable)
    tracker.json         ← Code-generation execution status
    generation.json      ← Last generation metadata
    architecture.md      ← System architecture
    init.sh              ← Setup AI tool configs
  <feature-slug>/
    specs.md             ← Technical specification
    requirements.md      ← Implementation acceptance checklist
    prompt.md            ← Implementation prompt
```

## AI Tool Setup

Run the init script to configure your AI tools automatically:

```bash
bash ./specs/.devx/init.sh
```

If you want execute permissions as well:

```bash
  chmod +x ./specs/.devx/init.sh && ./specs/.devx/init.sh
```

The script lists supported AI tools, lets you choose one, and creates only that tool's config files.
