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
| **Context understanding degrades as projects evolve** | AI doesn't understand the current project state, generating code inconsistent with project style and constraints | Read mode loads relevant docs by task type before coding to establish context awareness. Post-load checks enforce coding standard compliance and proactively alert on constraint violations |
| **Architecture loses control through iterations** | Architecture decisions scattered across code and verbal communication, no one maintains the global view | architecture.md maintains the global architecture view (topology, flows, constraints), while decisions.md tracks every decision in full ADR format (background, alternatives, decision, consequences) |
| **Context sync issues across sessions and collaborators** | Context resets to zero when switching people or sessions, high repeated communication costs | 5 persistent docs serve as a shared knowledge base across tools, sessions, and team members, loaded on demand per task type for instant context recovery |
| **Invisible impact scope for modifications** | Changing one module without knowing which upstream/downstream modules are affected | modules.md provides module dependency topology and impact quick-reference table (backbone), combined with code scanning to confirm actual impact scope; write mode syncs affected module descriptions |
| **Historical design decisions become untraceable** | "Why was it designed this way?" — no one can answer | decisions.md records decision background, alternative comparisons, final choices, and consequence impact in ADR format. Historical decisions auto-loaded during tech selection and architecture discussions |
| **Mixed granularity of context** | Architecture-level, module-level, and code-level information mixed together, hard to find focus | 5 docs separated by responsibility (architecture/tech-stack/coding/modules/decisions), with a document priority chain for conflict resolution and task-aware loading that provides only the granularity needed |
| **Docs, comments, and code fall out of sync** | Documentation written but never updated, gradually becoming misleading | Write mode checks code changes against a 25-item sync checklist, updates affected documentation, and performs cross-document consistency checks to prevent contradictions between docs |
| **Long context degradation** | Loading too much context at once, AI's attention to key information declines | When context becomes distorted due to decay or compression, re-read documents (backbone) and scan code and comments to restore accuracy. 10 task types enable selective loading of only the docs needed for the current task |

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
| Architecture | `docs/architecture.md` | Directory structure, project background, system architecture, future plans |
| Tech Stack | `docs/tech-stack.md` | Framework versions, dependency constraints, AI code generation limits |
| Coding Standards | `docs/coding.md` | Coding standards, naming conventions, API design standards, error handling, logging standards, testing standards |
| Module Registry | `docs/modules.md` | Module responsibilities, boundaries, APIs, dependencies, impact scope, scheduled tasks, state enums |
| Decision Records | `docs/decisions.md` | Architecture Decision Records (ADR: background, alternatives, decision, consequences) |

All documents come with initialization templates for first-time setup. Templates include project-type conditional comments for easy customization.

---

## Usage

See the skill definition files: [SKILL.md](SKILL.md) | [SKILL-CN.md](SKILL-CN.md)
