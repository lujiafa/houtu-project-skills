# Architecture Decision Records (ADR)
> This file records key architecture and technical decisions made in the project.
> AI loads this file during technology selection and architecture discussions to understand historical decisions and avoid redundant reversals.
> Maintenance rule: Append a record when an important decision is made; mark as "Superseded" when overturning a decision and add a new replacement ADR.

---

## ADR Index
| Number | Title | Status | Date |
|--------|-------|--------|------|
| ADR-001 | [Decision Title] | [Adopted] | [YYYY-MM-DD] |

> - Quick index of all ADRs, sorted in reverse chronological order
> - Available status values: Proposed / Adopted / Deprecated / Superseded (by ADR-xxx)

---

## When to Write an ADR
<!-- Help the team decide whether a record is needed -->

An ADR should be added in the following situations:
- A choice was made among multiple technical alternatives (e.g., selecting a database, framework, or communication method)
- A design rule was established that affects multiple modules (e.g., sharding strategy, unified error code scheme)
- A previous decision was overturned or modified
- An important new dependency or middleware was introduced
- A trade-off was made on performance, security, or availability that impacts the architecture

An ADR is NOT needed for:
- Pure code style preferences (record in `coding.md`)
- Bug fixes
- Implementation details that do not affect the architecture

---

## ADR Records
<!-- Record each ADR using the template below; most recent first -->

### ADR-001: [Decision Title]
**Status**: Adopted
**Date**: YYYY-MM-DD
**Proposer**: [who proposed it]

##### Background
<!-- What situation prompted this decision? What problem exists? -->
[Describe the problem background]

##### Alternatives Considered
| Alternative | Advantages | Disadvantages |
|-------------|-----------|---------------|
| Option A: [name] | [advantages] | [disadvantages] |
| Option B: [name] | [advantages] | [disadvantages] |
| Option C: [name] | [advantages] | [disadvantages] |

##### Decision
<!-- What did we choose? How will it be implemented? -->

##### Consequences
<!-- Impact of adopting this decision, both positive and negative -->
- **Positive**: [benefit 1, e.g.: Reduced deployment complexity]
- **Negative / Risk**: [risk 1, e.g.: Increased operational monitoring burden]
- **Follow-up TODOs**: [if any items need to be tracked]
