# houtu-web-security — Complete Guide

## Maven Dependency

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-web-security</artifactId>
</dependency>
```

Transitively includes: `houtu-web`, `houtu-cache` (→ `spring-boot-starter-data-redis`). **Redis is required.**

Optional: `redisson` (distributed lock), `cache2k-spring`/`caffeine` (L2 cache), `jjwt-api` (JWT session).

## Required Configuration

```yaml
houtu:
  web:
    sign:
      sign-key: "your-hmac-md5-key"   # REQUIRED for @CheckSign
    session:
      type: CACHE                      # CACHE (Redis, default) or JWT
      session-id-name: sid             # Header name for session ID
      expire: 1800s                    # Session TTL, default 30min
      delay: true                      # Auto-extend on request
      redis-base-key: "security:session:"

# Redis connection (required for CACHE type)
spring:
  data:                                # Redis config path varies by version, see version reference file for details
    redis:
      host: localhost
      port: 6379
```

**JWT mode additional config:**
```yaml
houtu:
  web:
    session:
      type: JWT
      jwt-signature-key: "your-base64-key"          # REQUIRED (must be Base64 encoded)
      jwt-signature-verify-key: "your-verify-key"   # Optional (public key Base64 for asymmetric algorithms)
      jwt-signature-algorithm: HS256                 # Default
```

### JWT Mode Practical Guide

**Differences from CACHE mode:**

| Dimension | CACHE (default) | JWT |
|-----------|----------------|-----|
| Session storage | Redis | Token self-contained (no server-side storage) |
| Client transport | Header `sid: <sessionId>` | Header `Authorization: Bearer <token>` |
| Login response | Response header `sid: <sessionId>` | Response header `Authorization: Bearer <token>` |
| Requires Redis | Yes | No (but `@CheckSign`/`@CheckRepeatRequest` still need Redis) |
| Renewal mechanism | Redis TTL auto-extend | Re-issue token (returns new Authorization header) |
| Logout | Delete session from Redis | Issue token with expiration time 0 (client discards) |
| Additional dependencies | None | `jjwt-api` + `jjwt-impl` + `jjwt-jackson` |

**JWT mode additional Maven dependencies:**
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <scope>runtime</scope>
</dependency>
```

> Version managed by houtu-dependencies BOM, no need to specify version.

**Supported signature algorithms (JWTSignatureAlgorithm):**

| Type | Algorithm | Key requirements |
|------|-----------|-----------------|
| HMAC (symmetric) | `HS256`, `HS384`, `HS512` | `jwt-signature-key` = Base64 encoded key |
| RSA (asymmetric) | `RS256`, `RS384`, `RS512` | `jwt-signature-key` = private key Base64, `jwt-signature-verify-key` = public key Base64 |
| ECDSA (asymmetric) | `ES256`, `ES384`, `ES512` | Same as RSA, using EC key pair |

**JWT mode complete login example:**

```java
// === application.yml ===
// houtu:
//   web:
//     session:
//       type: JWT
//       jwt-signature-key: "Base64 encoded key"
//       jwt-signature-algorithm: HS256
//       expire: 7200s

// === Login — code is exactly the same as CACHE mode ===
@PostMapping("/login")
public ResponseData<LoginVO> login(LoginForm form) {
    User user = userService.authenticate(form);

    Session session = SessionContext.create();
    session.setAttribute("userId", user.getId());
    session.addRoles(Set.of("user"));
    session.addPermissions(Set.of("order:read", "order:create"));
    SessionContext.save(session);
    // JWT mode: framework automatically writes JWT to response header Authorization: Bearer <token>
    // Client must include in subsequent requests: Authorization: Bearer <token>

    return ResponseData.success(new LoginVO(session.getId()));
}

// === Authorization — code is exactly the same as CACHE mode ===
@CheckSession
@RequiresPermission("order:read")
@GetMapping("/orders")
public ResponseData<List<OrderVO>> myOrders() {
    Session session = SessionContext.get();
    // In JWT mode, session data is parsed from token Claims, no Redis access needed
    Long userId = (Long) session.getAttribute("userId");
    return ResponseData.success(orderService.listByUserId(userId));
}
```

> **Key point**: Business code (Controller/Service) is **exactly the same** in CACHE and JWT modes. Just change `type` and key configuration in `application.yml` to switch. The framework automatically handles token issuance, parsing, and transport.

### Session Full Configuration Properties

| Property path | Type | Default | Description |
|--------------|------|---------|-------------|
| `houtu.web.security.enabled` | boolean | true | Whether to enable the security module |
| `houtu.web.session.type` | SessionRepositoryType | CACHE | Storage type: CACHE / JWT |
| `houtu.web.session.expire` | Duration | 1800s | Session validity period |
| `houtu.web.session.delay` | boolean | true | Whether to auto-renew |
| `houtu.web.session.login-url` | String | — | Login page URL |
| `houtu.web.session.session-id-name` | String | `sid` | Session ID field name in request header |
| `houtu.web.session.redis-base-key` | String | `security:session:` | Redis key prefix |
| `houtu.web.session.efficient-cache-name` | String | `session` | L2 cache name |
| `houtu.web.session.efficient-cache-sync-channel` | String | `session-sync` | L2 cache sync channel |
| `houtu.web.session.jwt-signature-key` | String | — | JWT signing key |
| `houtu.web.session.jwt-signature-verify-key` | String | — | JWT verification key (for asymmetric) |
| `houtu.web.session.jwt-signature-algorithm` | JWTSignatureAlgorithm | HS256 | JWT signature algorithm |
| `houtu.web.sign.sign-key` | String | — | HMAC-MD5 signing key |

---

## Session Management

```java
import io.github.lujiafa.houtu.websecurity.session.Session;
import io.github.lujiafa.houtu.websecurity.session.SessionContext;

// === Login ===
@PostMapping("/login")
public ResponseData<LoginVO> login(LoginForm form) {
    User user = userService.authenticate(form);

    Session session = SessionContext.create();       // New session with UUID
    session.setAttribute("userId", user.getId());
    session.setAttribute("userName", user.getName());
    session.addRoles(Set.of("admin", "user"));
    session.addPermissions(Set.of("user:read", "user:write", "order:read"));
    SessionContext.save(session);                    // Persists & returns session ID in response header

    return ResponseData.success(new LoginVO(session.getId()));
}

// === Access current session (after @CheckSession passes) ===
@CheckSession
@GetMapping("/me")
public ResponseData<UserVO> me() {
    Session session = SessionContext.get();
    Long userId = (Long) session.getAttribute("userId");
    return ResponseData.success(userService.getVO(userId));
}

// === Logout ===
@CheckSession
@PostMapping("/logout")
public ResponseData<Void> logout() {
    SessionContext.remove();    // Destroy session
    return ResponseData.success();
}
```

**Session interface methods:**
```java
String getId()
LocalDateTime getCreateTime()
void setAttribute(String name, Object value)
Object getAttribute(String name)
Object removeAttribute(String name)
Map<String, Object> getAttributes()
void addRole(String) / addRoles(Set<String>)
Set<String> getRoles()
void addPermission(String) / addPermissions(Set<String>)
Set<String> getPermissions()
```

**SessionContext static methods:**
```java
static String getSessionId()       // Get session ID from request header or Cookie
static Session create()            // Create new Session (UUID as ID)
static boolean save(Session)       // Persist and write to response header
static Session get()               // Get the current request's Session
static boolean delay(Session)      // Extend expiration time
static boolean remove()            // Destroy current Session
static void reset()                // Release ThreadLocal (called internally by framework)
```

**Client must send session ID** in request header (default name: `sid`).

---

## Security Annotations

Annotations can stack on same method. Processing order: session → sign → repeat → role → permission.

### @CheckSession — Require Valid Session

```java
import io.github.lujiafa.houtu.websecurity.annotation.CheckSession;

@CheckSession                   // All methods in class
@RestController
@RequestMapping("/api")
public class ApiController {

    @CheckSession(value = false) // Override: skip session check for this method
    @GetMapping("/public")
    public ResponseData<String> publicApi() { ... }
}
```

When session invalid: returns `{code:15, message:"SESSION_EXPIRED"}`.

### @RequiresRole / @RequiresPermission — RBAC

```java
import io.github.lujiafa.houtu.websecurity.annotation.RequiresRole;
import io.github.lujiafa.houtu.websecurity.annotation.RequiresPermission;
import io.github.lujiafa.houtu.websecurity.permission.Logic;

@CheckSession
@RequiresRole({"admin"})                                           // Any role matches (OR)
@PostMapping("/admin/config")
public ResponseData<Void> updateConfig() { ... }

@CheckSession
@RequiresPermission(value = {"user:read", "user:write"}, logic = Logic.AND)  // ALL required
@PutMapping("/user/{id}")
public ResponseData<Void> updateUser() { ... }
```

When denied: returns `{code:19, message:"ACCESS_PERMISSIONS_DENIED"}`.

### @CheckSign — Request Signature Verification

```java
import io.github.lujiafa.houtu.websecurity.annotation.CheckSign;

@CheckSign
@PostMapping("/pay")
public ResponseData<Void> pay(PayForm form) { ... }
```

**Signing algorithm (client-side):**
1. Sort all params by key (ASCII ascending)
2. Build: `key1=value1&key2=value2&...&key=<signKey>`
3. Exclude params named `sign` and `signature`
4. MD5 hash → send as `sign` parameter

When invalid: returns `{code:18, message:"INVALID_SIGNATURE_INFO"}`.

### @CheckRepeatRequest — Anti-Replay

```java
import io.github.lujiafa.houtu.websecurity.annotation.CheckRepeatRequest;

@CheckRepeatRequest
@PostMapping("/order")
public ResponseData<Order> createOrder(OrderForm form) { ... }
```

**Client must send** a unique `rid` parameter (header or query). Same ID within 15 minutes → rejected.

When repeated: returns `{code:8, message:"REQUEST_REPEAT"}`. **Requires Redis.**

---

## L2 Cache Session (Optional Performance Optimization)

Add `cache2k-spring` or `caffeine` dependency → auto-enables local cache layer before Redis:

```xml
<dependency>
    <groupId>org.cache2k</groupId>
    <artifactId>cache2k-spring</artifactId>
</dependency>
```

```yaml
houtu:
  web:
    session:
      efficient-cache-name: session           # Cache name
      efficient-cache-sync-channel: session-sync  # Pub/Sub channel for cluster sync
```

Architecture: `Request → L2 Cache (local) → Redis`. Cluster sync via Redis Pub/Sub.

---

## Common Mistakes

- `houtu-web-security` requires Redis — don't forget Redis configuration
- `@RequiresRole`/`@RequiresPermission` need `@CheckSession` on same or class level — session must exist first
- Session ID header name defaults to `sid` — client must send it
- `@CheckRepeatRequest` needs `rid` from client — not auto-generated
- JWT mode: `jwt-signature-key` is **required**, without it startup will fail
