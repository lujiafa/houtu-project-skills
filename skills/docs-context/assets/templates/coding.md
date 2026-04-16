# Code Design & Generation Standards
> This file defines the project's coding standards, naming conventions, API design standards, and error handling standards.
> AI must load and follow this file for any code generation or modification task.
> Maintenance rule: Must be updated whenever standards change, keeping documentation consistent with team consensus.

---

## Coding Standards

### Backend Coding Standards
#### Basic Principles
- [Principle 1, e.g.: Single Responsibility — each class/method does only one thing]
- [Principle 2, e.g.: Don't Repeat Yourself (DRY) — extract common logic into utility classes or base classes]
- [Principle 3, e.g.: Least Knowledge Principle — modules communicate through interfaces, not implementation details]

#### Layering Standards
<!-- Describe the project's layered architecture and the responsibility boundaries of each layer -->

#### Code Style

- Indentation: [spaces/Tab]
- Max line length: [characters]
- File encoding: UTF-8
- [Other style conventions]

#### Comment Standards
All interface methods and business methods must include comments: method-level comments explain business intent (what it does), inline comments explain key logic decisions (why it's done this way), enabling AI to reconstruct business context by scanning code and comments alone. Meaningless comments are prohibited (e.g., `// set name` `setName(name)`); comments must convey business semantics that the code itself cannot express.

<!-- If no database, this section can be removed -->
#### Database Design Standards

### Frontend Coding Standards
#### Basic Principles
<!-- Describe frontend coding basic principles -->

#### Component Design Standards
<!-- Describe component granularity, naming, Props design, composition vs inheritance, etc. -->

#### State Management Standards
<!-- Describe global state vs local state boundaries, Store design principles -->

#### Style Standards
<!-- Describe CSS approach (CSS Modules/Tailwind/CSS-in-JS, etc.), naming rules, responsive strategy -->

#### Comment Standards
<!-- Describe frontend comment standards -->

---

## Naming Conventions

### Backend Naming Conventions
<!-- Describe backend naming conventions -->

<!-- If no database, this section can be removed -->
### Database Naming Conventions
<!-- Describe database naming conventions -->

### Frontend Naming Conventions
<!-- Describe frontend naming conventions -->

### Business Naming Conventions
<!-- Unify naming for easily confused business terms -->

| Business Concept | Standard Name | Prohibited Usage |
|-----------------|---------------|-----------------|
| [Concept 1] | [standard name] | [prohibited aliases] |
| [Concept 2] | [standard name] | [prohibited aliases] |

<!-- Example:
| Merchant Number | merchantNo | mchId, mchNo, merchantId (when representing a number) |
| Order Number | orderNo | orderId (when representing a number), orderNum |
| Payment Amount | amount | money, price, fee (when representing total payment) |
-->

---

<!-- If the project has no HTTP APIs (e.g., pure frontend / pure utility library), this section can be removed -->
## API Design Standards

### Request Standards

- HTTP method semantics: GET for queries, POST for creation/operations, PUT for full updates, PATCH for partial updates, DELETE for deletion
- Path format: `/api/{module}/{resource}`, plural nouns, e.g., `/api/orders`, `/api/merchants/{id}`
- Request parameters: Query for lookups, JSON Body for creation/modification
- Pagination parameters: `pageNum` (starting from 1), `pageSize` (default [N], max [N])

### Response Standards

**Unified Response Structure**:

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

**Paginated Response Structure**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 0,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

### Status Code Standards

| code | Meaning | Usage Scenario |
|------|---------|---------------|
| 200 | Success | Request processed normally |
| 400 | Bad Request | Request parameter validation failed |
| 401 | Unauthorized | Not logged in or token expired |
| 403 | Forbidden | Logged in but insufficient permissions |
| 500 | Internal Error | Server internal error |
| [custom] | [meaning] | [scenario] |

---

<!-- If no backend services, this section can be removed -->
## Error Handling Standards

### Exception Classification

| Exception Type | Class Name | Description | HTTP Status Code |
|---------------|------------|-------------|-----------------|
| Business Exception | `BizException` | Predictable business errors (invalid params, disallowed state) | 200 (code ≠ 200) |
| System Exception | `SystemException` | Unpredictable system errors (DB connection failure, NPE) | 500 |
| Auth Exception | `AuthException` | Authentication and authorization errors | 401 / 403 |

### Error Code Standards

<!-- Define error code numbering rules and segments -->

| Range | Module | Example |
|-------|--------|---------|
| 10000-10999 | Common Errors | 10001 = Parameter validation failed |
| 11000-11999 | [Module A] | 11001 = [specific error] |
| 12000-12999 | [Module B] | 12001 = [specific error] |

### Exception Handling Rules

1. **No swallowing exceptions**: catch blocks must log or re-throw; empty catch blocks are prohibited
2. **No bare throws**: Must use project-defined exception classes; `throw new RuntimeException()` is prohibited
3. **Service layer throws business exceptions**: Throw `BizException` when business validation fails
4. **Controller layer does not handle exceptions**: Handled uniformly by the global exception handler
5. **Log levels**: Business exceptions at WARN, system exceptions at ERROR

---

<!-- If no backend services or no logging requirements, this section can be removed -->
## Logging Standards

### Log Levels
| Level | Usage Scenario | Example |
|-------|---------------|---------|
| ERROR | System exceptions, unrecoverable errors | Database connection failure, NPE |
| WARN | Recoverable exceptions, business rule violations | Business exceptions, parameter validation failures |
| INFO | Key business milestones, state changes | Order created, payment completed |
| DEBUG | Debug information, disabled in production | Method input/output parameters |

### Logging Rules
- [Rule 1, e.g.: Sensitive information must not be logged (passwords, keys, full phone numbers / ID numbers)]
- [Rule 2, e.g.: Logs must include traceId for distributed tracing]
- [Rule 3, e.g.: Log format standardized as JSON/Pattern]

---

<!-- If the project has no testing requirements, this section can be removed -->
## Testing Standards

### Testing Requirements
- [Requirement 1, e.g.: Core business logic must have unit tests]
- [Requirement 2, e.g.: API endpoints must have integration tests]
- [Requirement 3, e.g.: Test coverage target ≥ N%]

### Test Naming
- Test class naming: `[TestedClassName]Test`
- Test method naming: `[methodName]_[scenario]_[expectedResult]` (e.g., `createOrder_insufficientBalance_throwsBizException`)

### Mock Rules
- [Rule 1, e.g.: Only mock external dependencies (HTTP calls, MQ sends), do not mock the database]
- [Rule 2, e.g.: Mocking static methods is prohibited]

---

## Security Standards

<!-- Optional; add as needed for the project -->

- [Standard 1, e.g.: Sensitive data (passwords, keys) must not be stored in plaintext or logged]
- [Standard 2, e.g.: SQL parameters must use parameterized queries; concatenation is prohibited]
- [Standard 3, e.g.: Endpoints must have permission checks; unprotected endpoints are prohibited]

---

## Other Conventions

<!-- Place conventions that don't fit the above categories but the team must follow -->

- [Convention 1, e.g.: Git commit message format `type(scope): description`]
- [Convention 2, e.g.: Branch naming `feature/xxx`, `fix/xxx`, `hotfix/xxx`]
