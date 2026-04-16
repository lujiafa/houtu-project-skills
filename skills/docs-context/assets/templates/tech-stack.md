# Technology Stack & Version Specification
> This file records all technologies, version constraints, and AI code generation limits used in the project.
> AI loads this file when adding features, making technology selections, or changing dependencies to confirm constraints.
> Maintenance rule: Must be updated whenever a framework or library is introduced, upgraded, or removed.

---

<!-- If no backend services, this section can be removed -->
## Backend Technology Stack

### Core Framework
| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| [Language] | [version] | Development language | |
| [Framework] | [version] | Core framework | |
| [Build Tool] | [version] | Project build | |

### Data & Storage
| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| [Database] | [version] | Primary storage | [Special restrictions, e.g.: certain syntax prohibited] |
| [Cache] | [version] | Cache / sessions | |
| [ORM/Data Framework] | [version] | Data access | |

### Middleware
| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| [Message Queue] | [version] | Async messaging | |
| [Registry] | [version] | Service discovery & config | |
| [Task Scheduler] | [version] | Scheduled tasks | |

### Security & Authentication
| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| [Auth Framework] | [version] | Token / permission management | |

---

<!-- If no frontend applications, this section can be removed -->
## Frontend Technology Stack

### Frontend App A: [App Name]
| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| [Framework] | [version] | UI framework | |
| [State Management] | [version] | Global state | |
| [UI Component Library] | [version] | Component library | |
| [Build Tool] | [version] | Bundling | |
| [Language] | [version] | Development language | [e.g. TypeScript] |

### Frontend App B: [App Name] (if applicable)
| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| [Framework] | [version] | UI framework | |

---

## Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| [Container] | [version] | Local development / deployment |
| [API Testing] | [version] | API debugging |
| [Monitoring] | [version] | Tracing / monitoring |

---

## Version Constraints & Limits
<!-- Important: Explicitly document feature limitations caused by versions to prevent AI from generating incompatible code -->

### [Technology Name] [Version] Limits

<!-- Example: MySQL 5.7 limits -->
<!-- The following is an example format; replace with actual project constraints -->

- **Prohibited**: [Feature 1, e.g.: Window function ROW_NUMBER()]
- **Prohibited**: [Feature 2, e.g.: JSON_TABLE()]
- **Alternative**: [What to use instead, e.g.: Subquery + variable to simulate row numbers]

### [Technology Name] [Version] Limits

- **Prohibited**: [Feature]
- **Alternative**: [Alternative approach]

---

## AI Code Generation Constraints
<!-- Special restrictions for AI-assisted coding to ensure generated code matches the actual project environment -->

### Types & Precision

<!-- Example; replace with actual constraints -->
- [Constraint 1, e.g.: Amount fields must use Long type (unit: cents), BigDecimal/Double prohibited]
- [Constraint 2, e.g.: Rate fields use Long type (unit: basis points)]
- [Constraint 3, e.g.: Time fields use LocalDateTime, Date prohibited]

### Dependency Introduction Rules

- New dependencies must be confirmed compatible with existing versions before introduction
- Prefer existing project utility classes; reinventing the wheel is prohibited
- [Other constraints]

### Code Style

- Must follow the coding standards in `docs/coding.md`
- [Other constraints]
