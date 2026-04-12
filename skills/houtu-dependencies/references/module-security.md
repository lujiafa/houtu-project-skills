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
  data:                                # Redis 配置路径因版本而异，详见版本参考文件
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
      jwt-signature-key: "your-base64-key"          # REQUIRED（必须为 Base64 编码）
      jwt-signature-verify-key: "your-verify-key"   # Optional（非对称算法时为公钥 Base64）
      jwt-signature-algorithm: HS256                 # Default
```

### JWT 模式实战指南

**与 CACHE 模式的区别：**

| 维度 | CACHE（默认） | JWT |
|------|-------------|-----|
| 会话存储 | Redis | Token 自包含（无服务端存储） |
| 客户端传递 | 请求头 `sid: <sessionId>` | 请求头 `Authorization: Bearer <token>` |
| 登录响应 | 响应头 `sid: <sessionId>` | 响应头 `Authorization: Bearer <token>` |
| 是否依赖 Redis | 是 | 否（但 `@CheckSign`/`@CheckRepeatRequest` 仍需 Redis） |
| 续期方式 | Redis TTL 自动延长 | 重新签发 token（返回新 Authorization header） |
| 登出 | 删除 Redis 中 session | 签发过期时间为 0 的 token（客户端丢弃） |
| 额外依赖 | 无 | `jjwt-api` + `jjwt-impl` + `jjwt-jackson` |

**JWT 模式 Maven 额外依赖：**
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

> 版本由 houtu-dependencies BOM 管理，无需写 version。

**支持的签名算法（JWTSignatureAlgorithm）：**

| 类型 | 算法 | 密钥要求 |
|------|------|---------|
| HMAC（对称） | `HS256`, `HS384`, `HS512` | `jwt-signature-key` = Base64 编码的密钥 |
| RSA（非对称） | `RS256`, `RS384`, `RS512` | `jwt-signature-key` = 私钥 Base64，`jwt-signature-verify-key` = 公钥 Base64 |
| ECDSA（非对称） | `ES256`, `ES384`, `ES512` | 同 RSA，使用 EC 密钥对 |

**JWT 模式完整登录示例：**

```java
// === application.yml ===
// houtu:
//   web:
//     session:
//       type: JWT
//       jwt-signature-key: "Base64编码的密钥"
//       jwt-signature-algorithm: HS256
//       expire: 7200s

// === 登录 — 代码与 CACHE 模式完全一样 ===
@PostMapping("/login")
public ResponseData<LoginVO> login(LoginForm form) {
    User user = userService.authenticate(form);

    Session session = SessionContext.create();
    session.setAttribute("userId", user.getId());
    session.addRoles(Set.of("user"));
    session.addPermissions(Set.of("order:read", "order:create"));
    SessionContext.save(session);
    // JWT 模式：框架自动将 JWT 写入响应头 Authorization: Bearer <token>
    // 客户端后续请求需携带: Authorization: Bearer <token>

    return ResponseData.success(new LoginVO(session.getId()));
}

// === 鉴权 — 代码与 CACHE 模式完全一样 ===
@CheckSession
@RequiresPermission("order:read")
@GetMapping("/orders")
public ResponseData<List<OrderVO>> myOrders() {
    Session session = SessionContext.get();
    // JWT 模式下 session 数据从 token Claims 中解析，无需访问 Redis
    Long userId = (Long) session.getAttribute("userId");
    return ResponseData.success(orderService.listByUserId(userId));
}
```

> **关键点**：业务代码（Controller/Service）在 CACHE 和 JWT 模式下**完全一致**，只需改 `application.yml` 中的 `type` 和密钥配置即可切换。框架内部自动处理 token 的签发、解析和传递。

### Session 全部配置属性

| 属性路径 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `houtu.web.security.enabled` | boolean | true | 是否启用安全模块 |
| `houtu.web.session.type` | SessionRepositoryType | CACHE | 存储类型: CACHE / JWT |
| `houtu.web.session.expire` | Duration | 1800s | 会话有效期 |
| `houtu.web.session.delay` | boolean | true | 是否自动续期 |
| `houtu.web.session.login-url` | String | — | 登录页 URL |
| `houtu.web.session.session-id-name` | String | `sid` | 请求头中 session ID 字段名 |
| `houtu.web.session.redis-base-key` | String | `security:session:` | Redis key 前缀 |
| `houtu.web.session.efficient-cache-name` | String | `session` | L2 缓存名称 |
| `houtu.web.session.efficient-cache-sync-channel` | String | `session-sync` | L2 缓存同步频道 |
| `houtu.web.session.jwt-signature-key` | String | — | JWT 签名密钥 |
| `houtu.web.session.jwt-signature-verify-key` | String | — | JWT 验签密钥（非对称时） |
| `houtu.web.session.jwt-signature-algorithm` | JWTSignatureAlgorithm | HS256 | JWT 签名算法 |
| `houtu.web.sign.sign-key` | String | — | HMAC-MD5 签名密钥 |

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

**SessionContext 静态方法：**
```java
static String getSessionId()       // 从请求头或 Cookie 获取 session ID
static Session create()            // 创建新 Session（UUID 作为 ID）
static boolean save(Session)       // 持久化并写入响应头
static Session get()               // 获取当前请求的 Session
static boolean delay(Session)      // 延长过期时间
static boolean remove()            // 销毁当前 Session
static void reset()                // 释放 ThreadLocal（框架内部调用）
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
