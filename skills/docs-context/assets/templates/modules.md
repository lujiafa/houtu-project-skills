# Module Registry

> This file records the responsibilities and API purposes of all service modules in the system.
> AI consults this file first when coding, modifying, or debugging to locate target modules and interfaces.
> Maintenance rule: Must be updated whenever modules or interfaces are added, removed, or modified.

---

<!-- If no backend services, this section can be removed -->
## Backend Services
<!-- Fill in each service using the template below; duplicate as needed for each service -->

### [service-name] — [Service Title]

[Responsibility description]
[What it is NOT responsible for (explicit boundary)]

- Technology: [Primary framework / technology]
- Service name: `[registered name]`
- Core package: `[package path]`
- Database tables: `[table1]`, `[table2]`

##### Interfaces & Features

<!-- Describe each interface in the format: METHOD path — purpose, then describe processing logic on the next line -->
- [Module filename] (`[path]`) — File description
  - [METHOD] [path] — [Processing logic & purpose]
- [Module filename] — File description
    - [METHOD] [path] — [Processing logic & purpose]


<!-- If no RPC calls, this section can be removed -->
##### RPC
- [ClassName].[methodName]([params]) - [Purpose]

<!-- If no message queue, both MQ Production and MQ Consumption sections can be removed -->
##### MQ Production
- [TOPIC name]
  - [Message content]
  - [Who consumes it]
  - [Trigger timing]

##### MQ Consumption
- [TOPIC name]
  - [What happens after consumption]
  - [Message source]

<!-- If no scheduled tasks, this section can be removed -->
##### Scheduled Tasks
| Task Name | Cron Expression | Responsibility | Dependencies |
|-----------|----------------|----------------|-------------|
| [task name] | [expression] | [what it does] | [dependent modules / data] |

<!-- If no business state transitions, this section can be removed -->
##### Status Enums & State Machines
| Enum / State Machine | Value | Meaning | Allowed Transitions |
|---------------------|-------|---------|-------------------|
| [EnumName].[value] | [number/string] | [Business meaning] | → [next state 1], [next state 2] |

---

<!-- If no frontend applications, this section can be removed -->
## Frontend Modules

<!-- Fill in each frontend application using the template below -->

### [app-name] — [App Title]
[Description]

Technology: [Framework + State Management + UI Library]

#### Pages & API Relationships
| Page | Path | Function | Backend APIs Called |
|------|------|----------|-------------------|
| [page name] | `[path]` | [function] | `[API1]`, `[API2]` |
| [page name] | `[path]` | [function] | `[API1]` |

#### State Management
| Store | Responsibility | Core State |
|-------|---------------|------------|
| `[storeName]` | [responsibility] | [key fields] |
| `[storeName]` | [responsibility] | [key fields] |

---

## Dependency Topology
<!-- Describe inter-service call relationships -->

---

## Change Impact Quick-Reference Table

> When modifying a module, quickly check which upstream and downstream modules may be affected.

| Modified Module | Direct Impact | Key Checkpoints |
|----------------|---------------|----------------|
| [Module A] | [affected module list] | [most critical risk points] |
| [Module B] | [affected module list] | [most critical risk points] |
| [Module C] | [affected module list] | [most critical risk points] |
