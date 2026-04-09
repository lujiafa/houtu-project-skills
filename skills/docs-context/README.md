# docs-context

English | [中文](README-CN.md)

Project development context loader and documentation synchronizer — enabling context correction, completion, and reconstruction.

---

## What Problems Does It Solve

In AI-assisted development, missing or distorted project context is the core reason for declining code quality. docs-context addresses this through **context completion and reconstruction**:

| Problem | Symptom | How docs-context Helps |
|---------|---------|----------------------|
| **Context understanding degrades as projects evolve** | AI doesn't understand the current project state, generating code inconsistent with project style and constraints | Read mode: loads relevant docs by task type before coding to establish context awareness |
| **Architecture loses control through iterations** | Architecture decisions scattered across code and verbal communication, no one maintains the global view | architecture.md + decisions.md continuously track architecture and decision evolution |
| **Context sync issues across sessions and collaborators** | Context resets to zero when switching people or sessions, high repeated communication costs | 5 persistent docs serve as a shared knowledge base, loaded on demand per session |
| **Invisible impact scope for modifications** | Changing one module without knowing which upstream/downstream modules are affected | modules.md records module dependency topology and impact quick-reference table |
| **Historical design decisions become untraceable** | "Why was it designed this way?" — no one can answer | decisions.md records decision background, alternatives, and final choices in ADR format |
| **Mixed granularity of context** | Architecture-level, module-level, and code-level information mixed together, hard to find focus | 5 docs separated by responsibility (architecture/tech-stack/coding/modules/decisions) |
| **Docs, comments, and code fall out of sync** | Documentation written but never updated, gradually becoming misleading | Write mode: checks against sync checklist after coding, updates affected documentation |
| **Long context degradation** | Loading too much context at once, AI's attention to key information declines | Selectively loads only the docs needed for the current task type |

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
└─────────────────────┘              └─────────────────────┘
```

---

## Document System

| Document | Path | Responsibility |
|----------|------|---------------|
| Architecture | `docs/architecture.md` | Directory structure, project background, system architecture, future plans |
| Tech Stack | `docs/tech-stack.md` | Framework versions, dependency constraints, AI code generation limits |
| Coding Standards | `docs/coding.md` | Coding standards, naming conventions, API design standards, error handling |
| Module Registry | `docs/modules.md` | Module responsibilities, boundaries, APIs, dependencies, impact scope |
| Decision Records | `docs/decisions.md` | Architecture Decision Records (ADR) |

All documents come with initialization templates for first-time setup.

---

## Usage

See the skill definition files: [SKILL.md](SKILL.md) | [SKILL-CN.md](SKILL-CN.md)
