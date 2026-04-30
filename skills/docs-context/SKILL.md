---
name: docs-context
description: |
  Super Base Context — project context loader and documentation synchronizer for Agent Coding.

  Read mode loads project standards before coding (trigger: write/modify/add/remove/delete/deprecate/fix/refactor/optimize/design/implement/develop/code/build/create/update/spec/plan/test/migration/performance/security).

  Write mode syncs docs after coding. Trigger criterion: **current code state has a net delta vs. the last-synced doc state**.
  - **User triggers**: sync docs/update docs/done/completed/ready to commit/feature done/pre-commit check.
  - **Agent auto-trigger**: MUST fire right before the final task-completion reply; do not wait for user.
  - **Net delta**: additions/modifications/removals of landed content (code, config, SQL, build scripts), AND rollbacks of previously synced content (docs reverted accordingly).
  - **Does NOT fire on**: partial edits while task in progress, progress updates, read-only tasks, pure design/spec/plan authoring, try-and-undo with no net change, already-synced-this-round.
metadata:
  author: jonlu
  version: "1.2"
---

# docs-context — Context Loader & Doc Synchronizer
Manages reading and writing of project documentation, ensuring correct contextual constraints during development and keeping docs in sync with code afterward.

### Positioning: Super Base Context
docs-context is the **Super Base Context** for Agent Coding — inheriting and extending the base context concept with three key capabilities:
1. **Structured separation** — 5 documents with distinct responsibilities replace a single monolithic context file, enabling selective loading and reducing context noise.
2. **Task-aware loading** — Read mode dynamically loads only the documents relevant to the current task type, combating long-context attention degradation.
3. **Bidirectional sync** — Write mode keeps documentation synchronized with code changes, preventing context drift over time.

docs-context coexists with any AI tool's native project configuration files. Native configs handle tool-specific behavior and shortcuts; docs-context manages reusable project knowledge that persists across tools, sessions, and team members.

### Context Correction, Completion, and Reconstruction
The core goal of docs-context is to **correct, complete, and reconstruct** the AI agent's project context. Documents serve as the **backbone** — they capture the authoritative project knowledge (architecture, standards, modules, decisions, tech stack). However, documents alone cannot cover everything, especially in large-scale projects (large microservice + frontend systems). Therefore, docs-context works by combining **documents + code scanning + comment scanning**: documents provide the structural backbone, while code and comments fill in implementation-level details.

- **Correction** — Not limited to enforcing constraints on generated code. When context degrades due to long-conversation attention decay, context compression inaccuracies, or accumulated drift, the agent can re-read the relevant documents and scan the actual codebase to restore an accurate understanding. Documents act as the ground truth that pulls distorted context back on track.
- **Completion** — When the agent lacks context for the current task, documents provide the structural knowledge (architecture, module boundaries, dependencies, constraints), while code and comment scanning fills in the implementation specifics that documents may not cover.
- **Reconstruction** — When starting a new session or opening a project for the first time, the agent has zero knowledge of the project. By triggering this skill, the agent loads the relevant documents (backbone) and combines them with code and comment scanning to reconstruct a complete understanding of the project from scratch.

## Document Paths
All documents are located under the workspace `docs/` directory:
| Document | Path | Content |
|----------|------|---------|
| Architecture | `docs/architecture.md` | Workspace directory structure, project background, system architecture, service-level topology, constraints, future plans |
| Tech Stack | `docs/tech-stack.md` | Framework versions, dependency constraints, environment requirements, AI code generation limits |
| Coding Standards | `docs/coding.md` | Coding standards, naming conventions, API design standards, error handling, logging standards, testing standards |
| Module Registry | `docs/modules/<business>.md` | One file per business module. Each file is split internally by `## Capability:` sections; each capability holds its own implementation list (HTTP / RPC / MQ / scheduled tasks / DB tables / frontend pages), flow, state transitions, and local upstream/downstream |
| Decision Records | `docs/decisions/ADR-<slug>.md` | One file per architecture decision (ADR). Slug-only filenames (no numeric prefix, no date prefix). Date lives in frontmatter |

> **Why split into directories**: single monolithic `modules.md` / `decisions.md` files become git conflict hotspots in multi-window or multi-developer workflows. Per-business-module files and per-decision files isolate concurrent edits to different physical files.
>
> **No README / index files** under `docs/modules/` or `docs/decisions/`. The agent uses `Glob` to enumerate the directory and reads frontmatter / first-line responsibility on demand. This keeps the layout 100% conflict-free for additions and removals.

## Operating Modes
This skill has two modes, determined by the current task phase:

| Mode | Trigger | Responsibility |
|------|---------|----------------|
| **Read Mode** | Before coding / during design | Load relevant docs by task type, establish context awareness |
| **Write Mode** | After coding / before commit | Check code changes, sync affected documentation |

Decision rules:
- User wants to "do something" (write code, modify feature, fix bug, design solution) → **Read Mode**
- User says "done" (sync docs, pre-commit check, feature complete) → **Write Mode**
- Current code state has a net delta vs. the last-synced doc state (landed additions/modifications/removals, or rollbacks of previously synced content) → **Write Mode** (fire right before the final task-completion reply; skip if task was read-only / pure design / spec or plan authoring / in-task try-and-undo leaving no net change / already synced this round with no new changes after)
- When uncertain → default to **Read Mode**

## Trigger Rules
| Mode | Trigger Words | Notes |
|------|--------------|-------|
| **Read Mode** | write code, modify code, add feature, modify feature, remove/delete/deprecate feature, fix bug, refactor, optimize, design, design solution, tech selection, implement, develop, code, build, create, add, modify, update, remove, delete, deprecate, fix, spec, plan, test, write test, unit test, integration test, migration, schema, DDL, performance, optimize query, security, vulnerability | Any task involving code generation, modification, removal, or design |
| **Write Mode** | update docs, sync docs, code done, feature done, pre-commit check, development complete, done, completed, ready to commit, **[auto]** current code state has a net delta vs. last sync | Fires only when the current code state has a net delta vs. the last-synced doc state (including additions/modifications/removals, including rollbacks of previously synced content — docs must be reverted accordingly). On user completion signal, or agent self-triggers right before the final task-completion reply (not on partial edits while task is in progress, not on progress updates, not on read-only, not on pure design / spec / plan authoring, not on try-and-undo that left no net change). |

> When uncertain which mode applies, default to Read Mode.

# Read Mode: Context Loading

## Loading Context
### Always Load
Every time read mode is triggered, MUST load:
- `docs/coding.md` — Coding standards are the baseline constraint for all tasks

### Additional Loading by Task Type

In the table below, **`modules/*`** means: `Glob docs/modules/*.md` for the file list, then load 1–3 relevant `docs/modules/<x>.md` and Grep `## Capability:` inside them to focus on the matching capability section. **`decisions/*`** means: `Glob docs/decisions/ADR-*.md`, match by slug + frontmatter `tags` + `title`, load 0–2 most relevant ADR files in full. See the next section for the precise resolution algorithm.

| Task Type | Additional Docs | Trigger Criteria |
|-----------|----------------|-----------------|
| New feature/module | architecture.md + tech-stack.md + modules/* | add/create/implement new, creating new modules |
| Modify/optimize existing | modules/* + architecture.md | modify/adjust/optimize/refactor/update, or refactoring steps in a plan |
| Bug fix | modules/* | bug/fix/error/exception/debug, or during systematic-debugging flow |
| Tech selection/dependency change | tech-stack.md + decisions/* | introduce new lib/upgrade version/install/upgrade/migrate |
| Architecture discussion/design review | architecture.md + decisions/* + modules/* | architecture/design comparison/design review |
| API design/development | architecture.md + modules/* + tech-stack.md | design new API/modify API params/integration/API design |
| Testing/QA | modules/* + coding.md | writing tests/unit test/integration test/test/spec |
| Database migration | modules/* + tech-stack.md | add field/alter table/migration/schema/DDL/database change |
| Performance optimization | architecture.md + modules/* + tech-stack.md | slow query/performance/bottleneck/slow/perf/optimize query |
| Security fix/audit | coding.md + tech-stack.md + modules/* | security/XSS/injection/vulnerability/CVE/security audit |

### Multi-type Overlay
When a task spans multiple types (e.g., "add module and introduce new library"), merge and deduplicate all matching document sets.

## Module / ADR Resolution Strategy

Because `docs/modules/` and `docs/decisions/` have no README / index, the agent must resolve which files to load. Use the algorithms below to keep loads precise and bounded — the goal is to read the single capability that matters, not the whole module file.

> **Upstream / Downstream Convention (mandatory, do not invert)**:
> - **Upstream (this capability calls)** — outbound dependencies: APIs / RPCs / MQ topics this capability invokes.
> - **Downstream (depends on this capability)** — inbound consumers: callers, MQ consumers, frontend pages that depend on this capability.
>
> When reading existing fixtures or projects, if a `### Upstream / Downstream` sub-section appears to use the inverse convention, halt and ask the user to confirm direction before bidirectional sync — do not silently re-invert.

### Resolving a module file and capability

1. `Glob docs/modules/*.md` to get the slug list.
2. Match the task's keywords (business term, slug, controller path, table name, endpoint path) against filenames first.
3. If filename match is ambiguous or zero, Grep across `docs/modules/*.md` for those keywords (frontmatter / first responsibility line / `## Capability:` headings).
4. Load 1–3 candidate `modules/<x>.md` files. Inside each, **Grep for `## Capability:` headings** and prefer reading the matched capability section over the whole file.
5. If the task hits a module slug but no specific capability is identified, present the capability list back to the user: "This module exposes capabilities X / Y / Z — which one does this task target?"
6. Last-resort fallback: read `docs/architecture.md` service topology to reverse-locate, then ask the user.

### Resolving an ADR

1. `Glob docs/decisions/ADR-*.md` to get the slug list.
2. Match the task's decision keywords against slug, frontmatter `tags`, and `title`.
3. Load 0–2 most relevant ADRs in full.
4. Before authoring a new ADR (write mode), Grep across `docs/decisions/` to detect a pre-existing decision on the same topic — see Write Mode §"ADR Write Flow".

### Three context scenarios

**A — Reconstruction (new session, project unfamiliar):** Fixed sequence, ≤ 6–8 files.
1. `docs/coding.md`
2. `docs/architecture.md`
3. `docs/tech-stack.md`
4. `Glob docs/modules/*.md` (filename list only)
5. `Glob docs/decisions/ADR-*.md` (filename list only)
6. Match task keywords → load 1–2 `modules/<x>.md`, then Grep `## Capability:` to focus on the matched section
7. Match task keywords → load 0–1 most relevant `ADR-*.md`

After loading, **emit a Reconstruction Summary table** so the user (and future sessions) can see exactly what was loaded and why:

```
## Reconstruction Summary
| File | Why loaded |
|------|-----------|
| docs/coding.md | Mandatory standards |
| docs/architecture.md | Service topology |
| docs/tech-stack.md | Framework / version constraints |
| docs/modules/order.md | Owning module for this task |
| docs/decisions/ (Glob, none read) | No ADRs matched task keywords |
```

Keep the table compact (one row per file/Glob). If a Glob returned a list but no file was opened, state that explicitly — transparency about non-loads is as important as transparency about loads.

**B — Completion (already in a capability, need upstream/downstream):**
1. Read the current Capability section's `### Upstream / Downstream` (cheapest, most precise).
2. Load 1–2 referenced upstream / downstream module files; navigate to their corresponding Capability section. **Do not recurse** beyond one hop — avoid context blowout.
3. If still insufficient, Grep `docs/modules/*.md` for the business keyword or endpoint path.

**C — Correction (long-conversation attention drift):** Fastest restore path.
1. Re-read `docs/coding.md` (standards drift the fastest).
2. Re-read **only the current Capability section** of the active `docs/modules/<x>.md` (not the whole file).
3. If the task involves a recorded decision, re-read the single most relevant `ADR-*.md`.
4. **Do not** re-read `architecture.md` — it would re-blow the window.

## Post-load Behavior
1. Before generating code, confirm compliance with all constraints in `coding.md`
2. For modifications, combine the relevant `docs/modules/<x>.md` capability section (especially `### Upstream / Downstream`) with code scanning to confirm impact scope
3. For additions, confirm no conflict with existing module boundaries — check the candidate module file's responsibility line and capability list, plus the slug list under `docs/modules/`
4. If the current task may violate documented constraints, proactively alert the user.

   **When to HALT and present an A/B/C menu (must meet at least one trigger):**
   - **HARD constraint** — the conflicting rule in `coding.md` (or other docs) is marked with strong language: `MUST`, `STRICTLY ENFORCED`, `PROHIBITED`, `MANDATORY`, `非强制例外` (e.g. type conventions for money / rate / time, security rules, error-handling contracts).
   - **NEW divergence** — the violation has **no precedent in existing project code**. The task would introduce a fresh, isolated deviation.

   **When to PROCEED without halting (note in Doc Sync Summary instead):**
   - **SOFT divergence** — the task's deviation matches a deviation that **existing code already exhibits** (response envelope shape, path-prefix style, naming patterns, etc.). Treat as pre-existing tech debt between code and docs, not a new violation introduced by this task. Record it under `Needs User Confirmation` in the Doc Sync Summary so the team can decide separately whether to update `coding.md`, write an ADR, or migrate the existing code.

   The A/B/C menu (used only when HALT is required):
   - **(A) Override the standard** — proceed as requested; user must explicitly confirm; consider whether `coding.md` should be updated or an ADR recorded.
   - **(B) Use the compliant alternative** — show the proposed compliant version (with code snippet) and proceed once the user accepts.
   - **(C) Pause for clarification** — when requirements are ambiguous (e.g. value sourced from external system that forces the prohibited type).
5. When loaded documents do not provide sufficient detail for the current task, scan relevant source code and comments to supplement context understanding. Documents serve as the backbone (architecture, boundaries, constraints); code and comments fill in implementation-level specifics.
6. When generating code, write thorough comments for interfaces, methods, and important logic to ensure that AI agents in future sessions can reconstruct business context by scanning code and comments alone. If `coding.md` defines specific comment standards, follow those standards as the primary guideline.

### Document Priority
When documents contain conflicting guidance, higher-priority documents take precedence:

`coding.md` (mandatory standards) > `architecture.md` (architecture constraints) > `tech-stack.md` (technology limits) > `modules/*` (module & capability descriptions) > `decisions/*` (decision rationale)

---

# Write Mode: Doc Synchronization

## Doc Sync Checklist
Check each item against the current code changes. Only update affected docs; skip unaffected ones.

### modules/* — route every change to the right `<file> + Capability` section
The unit of edit is **one capability section in one module file**. Never dump changes at the module top level — they belong inside the capability that owns the implementation.

**Identifying the owning Capability**: For each change, ask "which user-visible business capability does this code change support?" and locate the matching `## Capability:` heading. Three cases:
- **One existing capability matches** → edit that section's relevant subsection (Implementation / Flow / State Transitions / Upstream-Downstream).
- **Multiple existing capabilities are involved** → edit each affected section; do not collapse them into one.
- **No existing capability matches** (the change supports a brand-new business operation) → ask the user whether to append a new `## Capability: <name>` section, and only proceed after confirmation. Never silently bury new business behavior inside an unrelated capability.

- [ ] Added a new business module → create `docs/modules/<slug>.md` from `assets/templates/module.md` (slug must be Glob-deduplicated and user-confirmed first; see "Slug Selection" below)
- [ ] Removed a business module → delete `docs/modules/<slug>.md`
- [ ] Added a new business capability inside an existing module → first Grep the module file for capabilities marked `Status: planned` whose name/scope matches the new code. If a planned capability is being made real, **promote it to `Status: live`** (in place) instead of appending a duplicate. Otherwise append a new `## Capability: <name>` section using the template's capability skeleton.
- [ ] Removed a business capability → delete the corresponding `## Capability:` section
- [ ] Added/modified/removed an HTTP API, RPC, MQ producer/consumer, or scheduled task → update the `### Implementation` sub-section of the owning capability (NOT a module-level interface list)
- [ ] Changed a business flow → update the `### Flow` sub-section of the owning capability
- [ ] Changed status enums or state machines → update the `### State Transitions` sub-section of the owning capability
- [ ] Added/modified frontend pages or stores → update the `### Implementation` sub-section of the capability the page serves
- [ ] Added/modified database tables or fields → (1) update the `## Module Overview` table list (2) note the table under `### Implementation` of the affected capability
- [ ] Changed module-level facts (technology, service name, core package) → update `## Module Overview`
- [ ] Changed dependency between capabilities or modules → bidirectional sync: update **this** capability's `### Upstream / Downstream` AND the affected capability's `### Upstream / Downstream` in the other module file

> When a single code change spans multiple capabilities, **iterate per capability section** — read the existing content, find the minimal change point, then write. Avoid wholesale rewrites of the module file, which would re-introduce the conflict surface that splitting was meant to eliminate.

### architecture.md
- [ ] Added/removed service → update service topology (service-level only)
- [ ] Changed inter-service communication → update architecture description
- [ ] Adjusted directory structure → update directory structure description
- [ ] Described future plans → update future plans section

### tech-stack.md
- [ ] Introduced new framework/library → Add to tech stack list with version and purpose
- [ ] Upgraded framework/library version → Update version number
- [ ] Removed framework/library → Remove from list
- [ ] Changed AI code generation constraints → Update constraints section

### coding.md
- [ ] Added/modified coding standards → Update corresponding section
- [ ] Added/modified API design standards → Update API standards section
- [ ] Added/modified error handling approach → Update error handling section
- [ ] Added/modified naming conventions → Update naming section

### decisions/*
- [ ] Made an important architecture or technical decision → create `docs/decisions/ADR-<slug>.md` from `assets/templates/decision.md` (slug user-confirmed; see "ADR Write Flow")
- [ ] Overturned a previous decision → **delete the old ADR file** AND create a new ADR file. Do not keep `Superseded` / `Deprecated` states. History remains accessible via `git log -- docs/decisions/`.

### Slug Selection (modules and ADRs)
Before creating any new file under `docs/modules/` or `docs/decisions/`:
1. Derive 1–3 candidate slugs from code signals (package name, controller path, table prefix, MQ topic prefix; for ADRs: decision keywords).
2. `Glob` the target directory and compare candidates against existing slugs — pay special attention to **synonyms** (e.g. `notify` vs `notification`) to avoid orphan files.
3. Present the chosen slug + the 3 most-similar existing slugs to the user for confirmation.
4. **Never silently create the file.**

### ADR Write Flow
1. Grep across `docs/decisions/` (frontmatter `tags`, `title`, Background section) using the decision's keywords. If a topic match is found, ask the user: "Topic already covered by `ADR-<old>.md` — replace or supplement?"
2. Propose slug + title. Wait for user confirmation.
3. If user chose **replace**: `rm docs/decisions/ADR-<old>.md`, then create `docs/decisions/ADR-<new>.md`.
4. If user chose **new**: just create `docs/decisions/ADR-<new>.md` with frontmatter.
5. The directory should only ever contain ADRs that match current code. Do not maintain superseded / deprecated states — that's what git history is for.

## Sync Execution Steps
1. Identify the scope of code changes to sync: inspect this-session edits plus, when needed, `git diff` / file state to detect prior unsynced landed changes
2. Filter to net delta: exclude changes that were tried and then reverted within this session (no net delta → skip to avoid false reporting)
3. Check against the above checklist item by item. For each module change, you MUST resolve **two** things before writing: (a) which `docs/modules/<x>.md` file owns the change, and (b) which `## Capability:` section within that file owns it. If (b) is unclear, follow the "Identifying the owning Capability" guidance in the modules/* checklist — including asking the user when no existing capability matches
4. For matched items, read the current content of the corresponding section (capability section preferred over whole-file read)
5. Execute updates following existing doc format and style (maintain consistency)
6. Cross-document consistency check: verify that updates to one document are consistent with related content in other documents (e.g., a new service in `modules/<x>.md` should also appear in `architecture.md` service topology; a cross-module dependency change must update both modules' capability `### Upstream / Downstream` sub-sections)
7. Identify shared files touched in this round (`architecture.md`, multiple module files in cross-module changes) — list them explicitly in the sync summary so reviewers can preempt merge conflicts
8. Output a sync summary to inform the user

## Handling Missing Documents
When a required document is missing, initiate the template-based creation and initialization flow. MUST confirm with user first; silent creation is forbidden.

### Document Initialization Flow
1. Ensure `docs/` directory exists; create if not
2. Confirm with user whether to create the missing document
3. After user approval, create UTF-8 document
4. Read template file content, combine with pending updates, initialize and save

### Document-to-Template Mapping
| File | Template |
|------|----------|
| `[workspace]/docs/architecture.md` | `[skills]/assets/templates/architecture.md` |
| `[workspace]/docs/tech-stack.md` | `[skills]/assets/templates/tech-stack.md` |
| `[workspace]/docs/coding.md` | `[skills]/assets/templates/coding.md` |
| `[workspace]/docs/modules/<slug>.md` | `[skills]/assets/templates/module.md` |
| `[workspace]/docs/decisions/ADR-<slug>.md` | `[skills]/assets/templates/decision.md` |

> The `docs/modules/` and `docs/decisions/` directories themselves are auto-created on first use (they have no README / index files of their own). Each new business module or decision is its own file derived from the corresponding template.

## Sync Summary Format
After completing sync, output in the following format:
```
## Doc Sync Summary

Code changes: [brief description of changes]

### Updated
- modules/<slug>.md → Capability "<name>" → Implementation: [what was updated]
- modules/<slug>.md → Capability "<name>" → Upstream/Downstream: [what was updated]
- architecture.md: [what was updated]
- ...

> When a task ran but produced **no net delta** (e.g. tried-and-reverted, or only logging tweaks with zero doc-relevant impact), still emit the summary with `Updated: (none)` so reviewers can see the sync ran and consciously found nothing to change. Silence is not the same as a clean pass.

### Created / Deleted
- Created: docs/modules/<new-slug>.md (user-confirmed)
- Deleted: docs/decisions/ADR-<old-slug>.md (replaced by ADR-<new-slug>.md)

### No Update Needed
- tech-stack.md: Tech stack unchanged
- coding.md: Standards unchanged
- ...

### Shared files touched (watch for merge conflicts)
- docs/architecture.md
- docs/modules/<slug-A>.md (also touched by capability X today)

### Needs User Confirmation
- decisions/: Chose xxx approach this time, should an ADR be recorded? Suggested slug: `ADR-...`
- modules/: New module candidate slug `notification`; closest existing slugs: [...]
```
