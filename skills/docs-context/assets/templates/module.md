# <Business> Module

> One-sentence module responsibility (what this business module owns).
> Boundary: NOT responsible for [explicit non-responsibilities — name the modules that own those instead].

---

## Module Overview

Cross-capability shared facts only. Specific endpoints / RPC / MQ live under their owning Capability section below.

- Technology: [primary framework / language]
- Service name: `[registered name]`
- Core package: `[package path]`
- Database tables (all owned by this module): `[table1]`, `[table2]`, `[table3]`
- Frontend apps (optional): `[app-name]`

---

## Capability: <Capability Name 1>

> One-sentence business intent (what users / callers can do).
> Trigger scenario: [who invokes this and when].

**Status**: live

> Status values: `live` (implemented and shipping), `planned` (designed but not yet implemented — promote to `live` when implementation lands; do NOT create a duplicate Capability section), `deprecated` (kept for traceability while callers migrate; remove once unreferenced).

### Implementation

List **every** technical artifact this capability uses. A capability often spans multiple layers — keep them together here so the end-to-end picture is in one place.

- HTTP API: `[METHOD] [path]` — [purpose] (`[controller class#method]`)
- RPC: `[ClassName.methodName(params)]` — [purpose / callers]
- MQ Production: `[topic]` — [message content]; consumers: `[consumer modules]`
- MQ Consumption: `[topic]` — [what happens after consuming]; producer: `[producer module]`
- Scheduled Task: `[task-name]` cron `[expression]` — [what it does]
- Database tables touched: `[table]` (insert / update / delete)
- Frontend page: `[path]` (`[app-name]`) — calls `[API list]`
- State management: `[storeName.action]` — [responsibility]

> Delete any sub-bullet the capability does not use. Do not leave empty placeholders.

### Flow

End-to-end execution path of this capability. ASCII diagram or numbered text — whichever reads clearly.

```
[trigger] → [step 1] → [step 2 with branch] → [outcome]
```

### State Transitions

Only include if the capability participates in a state machine.

- `[EnumName.STATE_A]` → `[STATE_B]` / `[STATE_C]`
- Trigger: [what causes the transition]

### Upstream / Downstream

Local view of dependencies for this specific capability (not the whole module).

- Upstream (this capability calls): `[module.api]`, `[rpc target]`, `[mq topic consumed]`
- Downstream (depends on this capability): `[caller module]`, `[mq consumer module]`

---

## Capability: <Capability Name 2>

> One-sentence business intent.
> Trigger scenario: [...]

### Implementation

- HTTP API: `[METHOD] [path]` — [purpose]
- [other layers as applicable]

### Flow

```
[trigger] → [...] → [outcome]
```

### State Transitions

- `[STATE_X]` → `[STATE_Y]`

### Upstream / Downstream

- Upstream: ...
- Downstream: ...

---

<!-- Add more `## Capability: ...` sections as the module grows. Keep each capability self-contained. -->

---

## Notes / Gotchas

Optional. Module-wide pitfalls, conventions, or TODOs that do not belong to a specific capability.

- [gotcha or TODO 1]
- [gotcha or TODO 2]
