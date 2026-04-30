# System Architecture Document
> This file describes the project's overall architecture, directory structure, and future plans.
> AI loads this file when adding features, modifying architecture, or conducting design reviews to gain global awareness.
> Maintenance rule: Must be updated whenever service topology, directory structure, or infrastructure changes.

---

## Project Background
<!-- Describe in 2-3 sentences what the project does and who it serves -->

---

## Workspace Directory Structure

<!-- List only core directories, not individual files. Keep 2-3 levels deep. -->

```
[workspace]/
├── docs/                    # Project context documents
│   ├── architecture.md      # System architecture document (this file)
│   ├── tech-stack.md        # Technology stack document
│   ├── coding.md            # Coding standards
│   ├── modules/             # One file per business module (vertical slice by capability)
│   │   ├── [business-a].md
│   │   └── [business-b].md
│   └── decisions/           # One file per architecture decision (ADR)
│       └── ADR-[slug].md
├── [service-a]/             # Service A
│   └── ...
├── [service-b]/             # Service B
│   └── ...
├── [frontend-a]/            # Frontend A
│   └── ...
└── ...
```

---

## System Architecture

### Architecture Overview

<!-- Describe the overall architecture style in text: monolithic / microservices / frontend-backend separation, etc. -->

[Project Name] uses [architecture style] architecture, consisting of [N] backend services and [N] frontend applications.

<!-- If no backend services or only a monolithic application, this section can be removed -->
### Service Topology

<!--
Service-level topology only (which service talks to which). Module-level and capability-level
topology — interfaces, RPC, MQ topics, internal flows — lives in `docs/modules/<business>.md`
under each `## Capability:` section. Do not duplicate that detail here.
-->

```
                    ┌──────────┐
                    │ [Gateway] │
                    └────┬─────┘
                         │
          ┌──────┬───────┼───────┬──────┐
          ▼      ▼       ▼       ▼      ▼
      [Svc A] [Svc B] [Svc C] [Svc D] [Svc E]
```

<!-- If no backend services or only a monolithic application, this section can be removed -->
### Core Flows
<!-- Describe the data flow of core business processes, e.g.: user request → gateway → Service A → database → response -->

**Core Flow: [Flow Name]**
```
[Client] → [Gateway] → [Service A] → [Service B] → [Database]
                                  ↓
                              [Message Queue] → [Service C]
```

---

## Architecture Constraints
<!-- Global mandatory rules that all services must follow -->

1. [Constraint 1, e.g.: All APIs must be authenticated through the gateway]
2. [Constraint 2, e.g.: Database operations only through the Service layer]
3. [Constraint 3, e.g.: Inter-service communication uses RPC/HTTP]
4. [Constraint 4, e.g.: Configuration managed centrally through a config center]

---

## Deployment Architecture
<!-- Optional: Describe deployment methods and environments -->

| Environment | Purpose | Address |
|-------------|---------|---------|
| dev | Development environment | [address] |
| staging | Pre-production environment | [address] |
| production | Production environment | [address] |

---

## Future Plans
<!-- Record confirmed architecture evolution directions to help AI understand the design trajectory -->

- [ ] [Plan 1, e.g.: Introduce distributed transaction solution]
- [ ] [Plan 2, e.g.: Migrate frontend to xxx framework]
- [ ] [Plan 3, e.g.: Database read-write separation]
