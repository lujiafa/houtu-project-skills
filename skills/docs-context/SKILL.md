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
  version: "1.1"
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
| Architecture | `docs/architecture.md` | Workspace directory structure, project background, architecture, future plans |
| Tech Stack | `docs/tech-stack.md` | Framework versions, dependency constraints, environment requirements, AI code generation limits |
| Coding Standards | `docs/coding.md` | Coding standards, naming conventions, API design standards, error handling, logging standards, testing standards |
| Module Registry | `docs/modules.md` | Module responsibilities, boundaries, API purposes, dependencies, impact scope, scheduled tasks, state enums |
| Decision Records | `docs/decisions.md` | Architecture and core module decision records (ADR) |

> When a document becomes very large, it can be split into subdirectories under `docs/` (e.g., `docs/modules/payment.md`), but this requires approval from the doc owner. The main document must index and reference the split files for progressive loading.

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
| Task Type | Additional Docs | Trigger Criteria |
|-----------|----------------|-----------------|
| New feature/module | architecture.md + tech-stack.md + modules.md | add/create/implement new, creating new modules |
| Modify/optimize existing | modules.md + architecture.md | modify/adjust/optimize/refactor/update, or refactoring steps in a plan |
| Bug fix | modules.md | bug/fix/error/exception/debug, or during systematic-debugging flow |
| Tech selection/dependency change | tech-stack.md + decisions.md | introduce new lib/upgrade version/install/upgrade/migrate |
| Architecture discussion/design review | architecture.md + decisions.md + modules.md | architecture/design comparison/design review |
| API design/development | architecture.md + modules.md + tech-stack.md | design new API/modify API params/integration/API design |
| Testing/QA | modules.md + coding.md | writing tests/unit test/integration test/test/spec |
| Database migration | modules.md + tech-stack.md | add field/alter table/migration/schema/DDL/database change |
| Performance optimization | architecture.md + modules.md + tech-stack.md | slow query/performance/bottleneck/slow/perf/optimize query |
| Security fix/audit | coding.md + tech-stack.md + modules.md | security/XSS/injection/vulnerability/CVE/security audit |

### Multi-type Overlay
When a task spans multiple types (e.g., "add module and introduce new library"), merge and deduplicate all matching document sets.

## Post-load Behavior
1. Before generating code, confirm compliance with all constraints in `coding.md`
2. For modifications, combine `modules.md` with code scanning to confirm impact scope
3. For additions, confirm no conflict with existing module boundaries in `modules.md`
4. If the current task may violate documented constraints, proactively alert the user
5. When loaded documents do not provide sufficient detail for the current task, scan relevant source code and comments to supplement context understanding. Documents serve as the backbone (architecture, boundaries, constraints); code and comments fill in implementation-level specifics.
6. When generating code, write thorough comments for interfaces, methods, and important logic to ensure that AI agents in future sessions can reconstruct business context by scanning code and comments alone. If `coding.md` defines specific comment standards, follow those standards as the primary guideline.

### Document Priority
When documents contain conflicting guidance, higher-priority documents take precedence:

`coding.md` (mandatory standards) > `architecture.md` (architecture constraints) > `tech-stack.md` (technology limits) > `modules.md` (module descriptions) > `decisions.md` (historical reference)

---

# Write Mode: Doc Synchronization

## Doc Sync Checklist
Check each item against the current code changes. Only update affected docs; skip unaffected ones.
### modules.md
- [ ] Added/removed module or service → Add/remove module entry
- [ ] Added/modified/removed API endpoint → Update endpoint description (method, path, purpose)
- [ ] Added/modified RPC interface → Update RPC description and caller info
- [ ] Changed inter-module dependencies → Update dependency description
- [ ] Changed module responsibilities or boundaries → Update responsibility and boundary description
- [ ] Added/modified MQ Topic → Update message production/consumption description
- [ ] Changed status enums or state machines → Update enum definitions and state transitions
- [ ] Added/modified frontend pages → Update frontend page and API call relation table
- [ ] Added/modified state management (Store) → Update state management table
- [ ] Added/modified scheduled tasks → Update task list
- [ ] Above changes affected other modules → Update impact quick-reference table

### architecture.md
- [ ] Added/removed service → Update service topology
- [ ] Changed inter-service communication → Update architecture description
- [ ] Adjusted directory structure → Update directory structure description
- [ ] Described future plans → Update future plans section

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

### decisions.md
- [ ] Made important architecture or technical decision → Append ADR record
- [ ] Overturned previous decision → Mark old ADR as "superseded", add new replacement ADR

## Sync Execution Steps
1. Identify the scope of code changes to sync: inspect this-session edits plus, when needed, `git diff` / file state to detect prior unsynced landed changes
2. Filter to net delta: exclude changes that were tried and then reverted within this session (no net delta → skip to avoid false reporting)
3. Check against the above checklist item by item
4. For matched items, read the current content of the corresponding doc
5. Execute updates following existing doc format and style (maintain consistency)
6. Cross-document consistency check: verify that updates to one document are consistent with related content in other documents (e.g., a new service in modules.md should also appear in architecture.md service topology)
7. Output a sync summary to inform the user

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
| `[workspace]/docs/modules.md` | `[skills]/assets/templates/modules.md` |
| `[workspace]/docs/decisions.md` | `[skills]/assets/templates/decisions.md` |

## Sync Summary Format
After completing sync, output in the following format:
```
## Doc Sync Summary

Code changes: [brief description of changes]

### Updated
- modules.md: [what was updated]
- architecture.md: [what was updated]
- ...

### No Update Needed
- tech-stack.md: Tech stack unchanged
- coding.md: Standards unchanged
- ...

### Needs User Confirmation
- decisions.md: Chose xxx approach this time, should an ADR be recorded?
```
