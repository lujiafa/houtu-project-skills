# docs-context

English | [中文](README-CN.md)

**Super Base Context** for Agent Coding — project context loader and documentation synchronizer, enabling context correction, completion, and reconstruction.

---

## Core Capabilities

docs-context addresses the root cause of declining code quality in Agent Coding — missing and distorted project context — through three core capabilities. Documents serve as the **backbone**, carrying authoritative project knowledge; but documents alone cannot cover everything (especially in large microservice + frontend systems), so docs-context works by combining **documents + code scanning + comment scanning**:

| Capability | What It Solves | How It Works |
|-----------|---------------|-------------|
| **Correction** | Context becomes distorted due to long-conversation attention decay, compression inaccuracies, or accumulated drift | Re-read relevant documents and scan actual code to restore accurate understanding. Documents serve as the ground truth that pulls distorted context back on track; document conflicts resolved via priority chain (coding > architecture > tech-stack > modules > decisions) |
| **Completion** | Agent lacks the project context needed for the current task | 10 task types intelligently matched, loading relevant docs on demand for structural knowledge (architecture, module boundaries, dependencies, constraints); code and comment scanning fills in implementation details that documents may not cover |
| **Reconstruction** | Starting a new session or opening a project for the first time, the agent has zero project knowledge | Trigger the skill to load documents (backbone) combined with code and comment scanning, reconstructing a complete understanding of the project from scratch. When documents are missing, template initialization creates the backbone |

---

## What Problems Does It Solve

| Problem | Symptom | How docs-context Helps |
|---------|---------|----------------------|
| **Context understanding degrades as projects evolve** | AI doesn't understand the current project state, generating code inconsistent with project style and constraints | Read mode loads relevant docs whenever work references real project state — coding, designing, spec / plan authoring, architecture review, tech selection, ADR research, performance / security analysis, code review — to establish context awareness. Post-load checks enforce coding standard compliance and proactively alert on constraint violations |
| **Architecture loses control through iterations** | Architecture decisions scattered across code and verbal communication, no one maintains the global view | `architecture.md` maintains the global architecture view (service topology, flows, constraints); `docs/decisions/ADR-<slug>.md` (one file per decision) tracks every decision in full ADR format (background, alternatives, decision, consequences). When superseded, the old ADR is deleted — only live decisions remain |
| **Context sync issues across sessions and collaborators** | Context resets to zero when switching people or sessions, high repeated communication costs | A persistent doc system (architecture, tech-stack, coding, plus `docs/modules/` and `docs/decisions/` directories) serves as a shared knowledge base across tools, sessions, and team members, loaded on demand per task type |
| **Invisible impact scope for modifications** | Changing one module without knowing which upstream/downstream modules are affected | Each `docs/modules/<business>.md` is split internally by `## Capability:` sections; each capability carries its own `### Upstream / Downstream` for local-view dependency. Cross-module changes trigger bidirectional sync between affected capability sections |
| **Historical design decisions become untraceable** | "Why was it designed this way?" — no one can answer | `docs/decisions/ADR-<slug>.md` records each decision (background, alternatives, decision, consequences) in its own file. Historical decisions auto-loaded during tech selection and architecture discussions |
| **Mixed granularity of context** | Architecture-level, module-level, and code-level information mixed together, hard to find focus | Docs separated by responsibility (architecture / tech-stack / coding / modules / decisions); inside each module, capability-level sections separate concerns further. A document priority chain resolves conflicts and task-aware loading provides only the granularity needed |
| **Docs, comments, and code fall out of sync** | Documentation written but never updated, gradually becoming misleading | Write mode checks code changes against the sync checklist (bidirectional — additions / modifications grow docs, removals / rollbacks shrink them), routes each change to the right `<file> + Capability` section, and performs cross-document consistency checks to prevent contradictions between docs. Reverse sync (delete capability / module / ADR section when corresponding code is removed) is a first-class concept distinct from in-session try-and-undo |
| **Long context degradation** | Loading too much context at once, AI's attention to key information declines | When context becomes distorted due to decay or compression, re-read the relevant capability section (not whole files) and scan code/comments to restore accuracy. 10 task types enable selective loading of only the docs needed for the current task |
| **Multi-window / multi-developer git docs conflicts** | Single monolithic `modules.md` / `decisions.md` files become merge-conflict hotspots when multiple people work in parallel | Per-business-module files and per-decision files isolate concurrent edits to different physical files. No README/index files inside `docs/modules/` or `docs/decisions/` — additions/removals are 100% conflict-free |

---

## How It Works

```
Before Coding (Read Mode)            After Coding (Write Mode)
┌─────────────────────┐              ┌─────────────────────┐
│ Determine task type  │              │ Review code changes  │
│         ↓           │              │         ↓           │
│ Load relevant docs   │  → Coding →  │ Check sync checklist │
│         ↓           │              │         ↓           │
│ Establish constraints│              │ Update affected docs │
│         ↓           │              │         ↓           │
│ Check compliance     │              │ Cross-doc consistency│
└─────────────────────┘              └─────────────────────┘
```

---

## Document System

| Document | Path | Responsibility |
|----------|------|---------------|
| Architecture | `docs/architecture.md` | Directory structure, project background, system architecture, service-level topology, constraints, future plans |
| Tech Stack | `docs/tech-stack.md` | Framework versions, dependency constraints, AI code generation limits |
| Coding Standards | `docs/coding.md` | Coding standards, naming conventions, API design standards, error handling, logging standards, testing standards |
| Module Registry | `docs/modules/<business>.md` | One file per business module. Internally split by `## Capability:` sections; each capability holds its own implementation list (HTTP / RPC / MQ / scheduled tasks / DB tables / frontend pages), flow, state transitions, and local upstream/downstream |
| Decision Records | `docs/decisions/ADR-<slug>.md` | One file per architecture decision (ADR). Slug-only filenames (no numeric prefix, no date prefix). Date lives in frontmatter. Old decisions are deleted when superseded — only live decisions remain |

All documents come with initialization templates for first-time setup. Templates include project-type conditional comments for easy customization. The `docs/modules/` and `docs/decisions/` directories have **no README/index files** — the agent enumerates them via `Glob` on demand.

### Layout at a glance

```
docs/
├── architecture.md            # service-level topology & global constraints
├── tech-stack.md
├── coding.md
├── modules/                   # one file per business module
│   ├── order.md               # ## Module Overview + ## Capability: Create Order + ## Capability: Refund + ...
│   └── payment.md             # ## Module Overview + ## Capability: Pre Charge + ## Capability: Settle + ...
└── decisions/                 # one file per architecture decision
    ├── ADR-payment-gateway-selection.md
    └── ADR-order-state-machine-redesign.md
```

Each `## Capability:` section is self-contained: its `### Implementation` lists every artifact the capability touches (HTTP API, RPC, MQ producer/consumer, scheduled task, DB tables, frontend pages); its `### Flow` shows the end-to-end path; its `### Upstream / Downstream` records local dependencies. Cross-module dependencies are expressed by **bidirectional edits** to two capability sections in two files — there is no global dependency matrix to keep in sync.

---

## Usage

See the skill definition file: [SKILL.md](SKILL.md)
