# <Capability Name>

> One-sentence business intent (what users / callers can do).
> Trigger scenario: [who invokes this and when].

**Status**: live
**Owning service**: `<service-name>` · `<core-package>`
**Database tables touched**: `<table1>`, `<table2>`

> Status values: `live` (implemented and shipping), `planned` (designed but not yet implemented — promote in place when implementation lands), `deprecated` (kept for traceability while callers migrate; remove once unreferenced).

> **One file = one Business Capability Unit (BCU).** A BCU is a piece of business value that can be developed, tested, and delivered independently, where modifying it primarily affects this single business chain. Do NOT split by microservice / Controller / API / technical module / database table; DO split by real business chain / actual development task boundary / parallel-development unit. See SKILL.md "BCU Splitting Principle" for the decision flow.

## Business Goal

- Goal: <business goal — what value this BCU delivers>
- Applicable platform / scenario: <consumer side / merchant side / batch job / etc.>

## Implementation

List **every** technical artifact this BCU uses. A BCU often spans multiple layers — keep them together so the end-to-end picture is in one place. Only list sub-bullets that actually exist; delete the ones that do not apply.

> **Per-entry tracing diagrams (optional, but complete-when-present)**: each *entry-point* bullet — HTTP API (inbound), MQ Consumption, Scheduled Task, Third-party Callback — MAY carry its own Mermaid `sequenceDiagram` tracing this entry's full call chain (services / RPC / MQ Production / external systems / resources / DB) end-to-end. Two rules apply together:
> 1. **Optional** — skip the diagram when the entry is trivial (e.g. single read-and-return, no cross-service hops). Not every entry needs one.
> 2. **Complete when present** — if a diagram is drawn, it MUST trace every real hop end-to-end. Half-drawn / placeholder / partial-chain diagrams are forbidden — they mislead more than they help. Either skip or finish.
>
> **Do NOT** attach diagrams to non-entry items: outbound RPC calls, MQ Production, Database tables, Frontend page, State management. These appear as nodes inside entry diagrams; a separate diagram would be redundant.

- HTTP API: `[METHOD] [path]` — [purpose] (`[controller class#method]`)

  ```mermaid
  sequenceDiagram
    participant Caller
    participant ThisService
    participant DB
    participant ExternalGateway
    Caller->>ThisService: [METHOD] [path]
    ThisService->>DB: persist
    ThisService->>ExternalGateway: invoke
    ExternalGateway-->>ThisService: response
    ThisService-->>Caller: result
  ```

- MQ Consumption: `[topic]` — [what happens after consuming]; producer: `[producer BCU slug]`

  ```mermaid
  sequenceDiagram
    participant MQ
    participant ThisService
    participant DB
    MQ->>ThisService: consume [topic]
    ThisService->>DB: update
  ```

- Scheduled Task: `[task-name]` cron `[expression]` — [what it does]

  <!-- Attach a sequenceDiagram only if the task spans multiple services / resources. Trivial single-table scans can stay diagram-free. -->

- Third-party Callback: `[provider]` `[event]` → `[handler class#method]` — [what the callback signals]

  <!-- Attach a sequenceDiagram if the callback triggers cross-service reactions. -->

- RPC: `[ClassName.methodName(params)]` — [purpose / callers]
  <!-- No separate diagram — appears as a node in the calling entry's diagram. -->

- MQ Production: `[topic]` — [message content]; consumers: `[consumer BCU slugs]`
  <!-- No separate diagram — appears as a node in the producing entry's diagram. -->

- Database tables touched: `[table]` (insert / update / delete)
- Frontend page: `[path]` (`[app-name]`) — calls `[API list]`
- State management: `[storeName.action]` — [responsibility]

<!-- Omit this entire section if the BCU has no business-level flow worth describing beyond what ## Implementation already shows (e.g. a single-entry trivial BCU). Do not keep an empty heading and do not restate Implementation as a one-liner. -->

## Flow

Business-level flow(s) of the BCU — how front-end interactions / business steps / state transitions weave through the entry points listed in `## Implementation`. This is the **business view**: what business step happens, which interface gets called to achieve what, what the user sees / what state advances.

A BCU may have **0, 1, or N** business flows here:
- **0** — omit the section entirely (single-entry trivial BCUs).
- **1** — write one diagram (or numbered text) directly under `## Flow`.
- **N** — when the BCU contains multiple distinct business sub-flows (e.g. passive-scan vs aggregated-scan vs refund), use `### <Sub-flow name>` headings, one diagram per sub-flow. Do not force mutually exclusive branches into a single bloated diagram.

Use ASCII / numbered text or Mermaid `sequenceDiagram` / `flowchart` per sub-flow — choose what reads clearly.

> **Non-redundancy with `## Implementation` tracing diagrams**:
> - These diagrams' nodes are **business steps / user actions / state transitions**, NOT service hops.
> - When the business flow invokes an entry, just **reference its name** (e.g. "calls `POST /pay/passive-scan`"); do NOT redraw the entry's internal call chain — that lives in the entry's own tracing diagram under `## Implementation`.

Single-flow example:

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Front-end
  participant BFF as BFF
  participant BCU as ThisBCU
  Note over U,FE: business step 1
  FE->>BFF: action
  BFF->>BCU: calls [entry endpoint name]
  Note over BCU: business step 2 — state advances
  BCU-->>FE: business outcome
```

Multi-flow shape (use `### <Sub-flow>` headings — one diagram each).

<!-- Omit the entire section below if the BCU has no state machine. -->

## State Transitions

- `[EnumName.STATE_A]` → `[STATE_B]` / `[STATE_C]`
- Trigger: [what causes the transition]

<!-- Omit the entire section below if the BCU has no upstream/downstream relationships to record. -->

## Upstream / Downstream

- Upstream (this BCU calls): `[bcu-slug]`, `[rpc target]`, `[mq topic consumed]`
- Downstream (depends on this BCU): `[caller bcu-slug]`, `[mq consumer bcu-slug]`

<!-- Omit the entire section below if the BCU has no third-party / external system integration. -->

## External Dependencies

- `[3rd-party system / SaaS / gateway]` — purpose + integration mode (HTTP / SDK / webhook)

<!-- Omit the entire section below if the BCU is not part of a multi-BCU business chain. -->

## Related Business Flows

- `[bcu-slug]` — together with this BCU forms `[business chain name]`

<!-- Omit the entire section below if no BCU-specific risks/constraints apply. -->

## Risks / Constraints

- [risk or constraint that future modifications must respect]

<!-- Omit the entire section below if no module-wide gotchas apply. -->

## Notes / Gotchas

- [gotcha or TODO]
