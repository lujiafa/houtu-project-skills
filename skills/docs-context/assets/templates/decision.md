---
title: <Decision Title>
date: YYYY-MM-DD
proposer: <name>
tags: [<topic1>, <topic2>]
---

# <Decision Title>

## Background

What situation prompted this decision? What problem exists?
Be concrete: name the constraint, the failure mode, the trigger event, or the stakeholder request.

## Alternatives Considered

| Alternative | Advantages | Disadvantages |
|-------------|-----------|---------------|
| Option A: [name] | [advantages] | [disadvantages] |
| Option B: [name] | [advantages] | [disadvantages] |
| Option C: [name] | [advantages] | [disadvantages] |

## Decision

What did we choose? How will it be implemented? Reference the modules / capabilities affected (e.g., `docs/modules/payment.md` Capability `Process Charge`).

## Consequences

- **Positive**: [benefit 1, e.g., reduced deployment complexity]
- **Negative / Risk**: [risk 1, e.g., increased operational monitoring burden]
- **Follow-up TODOs**: [tracked items, owners if known]

<!--
File naming:
  ADR-<slug>.md  (lowercase, hyphenated, ≤60 chars, no numeric prefix, no date prefix)

When superseded:
  Delete this file and create a new ADR-<new-slug>.md.
  Do NOT keep Superseded/Deprecated states. History lives in git (`git log -- docs/decisions/`).
-->
