---
name: docs-context
description: >
  Project development context loader and documentation synchronizer.
  [Pre-development: Context Loading] Before any code design, writing, modification, optimization, refactoring, bug fixing, solution discussion, API design, or technology selection, this skill MUST be triggered first to load project standards and module information.
  Trigger words: write code, modify code, add feature, modify feature, fix bug, refactor, optimize, design solution, tech selection, implement, develop, code, build, create, add, modify, update, fix, refactor, optimize, design、spec、plan.
  Any task involving code generation or modification should trigger this skill.
  [Post-development: Doc Sync] Triggered after code changes are complete to check and sync project documentation with code.
  Trigger words: update docs, sync docs, code done, feature done, pre-commit check, development complete, sync docs, update docs, done, completed, ready to commit.
  Any task involving code generation or modification should trigger this skill.
metadata:
  author: jonlu
  version: "1.0"
---

# docs-context — Context Loader & Doc Synchronizer
Manages reading and writing of project documentation, ensuring correct contextual constraints during development and keeping docs in sync with code afterward.

## Document Paths
All documents are located under the workspace `docs/` directory:
| Document | Path | Content |
|----------|------|---------|
| Architecture | `docs/architecture.md` | Workspace directory structure, project background, architecture, shared infrastructure resources, future plans |
| Tech Stack | `docs/tech-stack.md` | Framework versions, dependency constraints, environment requirements, AI code generation limits |
| Coding Standards | `docs/coding.md` | Coding standards, naming conventions, API design standards, error handling standards |
| Module Registry | `docs/modules.md` | Module responsibilities, boundaries, API purposes, dependencies, impact scope |
| Decision Records | `docs/decisions.md` | Architecture and core decision records (ADR) |

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
- When uncertain → default to **Read Mode**


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

### Multi-type Overlay
When a task spans multiple types (e.g., "add module and introduce new library"), merge and deduplicate all matching document sets.

## Post-load Behavior
1. Before generating code, confirm compliance with all constraints in `coding.md`
2. For modifications, combine `modules.md` with code scanning to confirm impact scope
3. For additions, confirm no conflict with existing module boundaries in `modules.md`
4. If the current task may violate documented constraints, proactively alert the user

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
- [ ] Introduced new infrastructure component → Update infrastructure section

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
1. Review the scope of all code changes in this session
2. Check against the above checklist item by item
3. For matched items, read the current content of the corresponding doc
4. Execute updates following existing doc format and style (maintain consistency)
5. Output a sync summary to inform the user

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
