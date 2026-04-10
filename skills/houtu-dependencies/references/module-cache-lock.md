# houtu-cache — Complete Guide

## Maven Dependency

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-cache</artifactId>
</dependency>
```

Transitively includes: `spring-boot-starter-data-redis`, `commons-pool2`, `houtu-core`, `houtu-utils`.

**For @Lock: add Redisson** (required):
```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
</dependency>
```

## Required Configuration

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

Redisson auto-initializes from Spring Redis properties if on classpath.

---

## @Lock — Distributed Lock (Requires Redisson)

```java
import io.github.lujiafa.houtu.lock.annotation.Lock;

// Basic: lock by parameter name, auto-release after method returns
@Lock(prefix = "order:", key = "orderId")
public void processOrder(String orderId) {
    // Only one thread processes this orderId at a time
}

// With timeouts
@Lock(prefix = "pay:", key = "paymentId", waitTime = 5, leaseTime = 30)
public boolean pay(String paymentId) {
    // Wait up to 5s to acquire lock, hold max 30s
}

// Nested parameter (reads form.getUserId())
@Lock(prefix = "user:", key = "form.userId")
public void updateUser(UserForm form) { ... }
```

**Annotation attributes:**
- `prefix` — prepended to lock key (default: `""`)
- `key` — parameter name to use as key. If empty, uses `className.methodName`
- `leaseTime` — max lock hold time in `unit` (-1 = indefinite, default)
- `waitTime` — max wait to acquire (-1 = block forever, default)
- `unit` — TimeUnit (default: SECONDS)

**Internal: Redis key = `redis:distributed:lock:` + prefix + resolved key. Uses Redisson FairLock.**

### Programmatic Lock (LockSupport)

```java
import io.github.lujiafa.houtu.lock.support.BLock;
import io.github.lujiafa.houtu.lock.support.LockSupport;

// Try-with-resources (auto-unlock)
try (BLock lock = LockSupport.getLock("order:" + orderId, 30)) {
    if (lock.tryLock(5, TimeUnit.SECONDS)) {
        // critical section
    } else {
        throw new BusinessException(2, "获取锁超时");
    }
}  // auto unlock via close()

// Or manual try-finally
BLock lock = LockSupport.getLock("myKey", 30, TimeUnit.SECONDS);
try {
    lock.lock();  // block until acquired
    // critical section
} finally {
    lock.unlock();
}

// Direct Redisson RLock access
RLock rlock = LockSupport.getRlock("myKey");
```

**LockSupport methods (all static):**
```java
static RLock getRlock(String lockKey)
static BLock getLock(String lockKey)
static BLock getLock(String lockKey, long leaseTime)
static BLock getLock(String lockKey, long leaseTime, TimeUnit unit)
```

**BLock methods:** `lock()`, `tryLock()` (3s default wait), `tryLock(waitTime, unit)`, `unlock()`, `close()`

> **注意**：`BLock` 实现了 `AutoCloseable`，`close()` 内部调用 `unlock()`。使用 try-with-resources 时，`getLock()` 仅创建锁对象，不自动加锁，需手动调用 `lock()` 或 `tryLock()`。

---

## RateLimiter — Distributed Rate Limiting

```java
import io.github.lujiafa.houtu.limit.RateLimiter;

// Build a fixed sliding window limiter
RateLimiter limiter = RateLimiter.fixSlidingWindow(redisTemplate)
    .name("api:order:create")
    .limit(100)                          // 100 requests
    .windowSize(Duration.ofSeconds(10))  // per 10 seconds
    .build();

// Or rolling sliding window (more precise, no boundary spike)
RateLimiter limiter = RateLimiter.rollingSlidingWindow(redisTemplate)
    .name("api:order:create")
    .limit(100)
    .windowSize(Duration.ofSeconds(10))
    .build();

// Usage
if (limiter.tryAcquire()) {
    // allowed
} else {
    throw new BusinessException(9, "请求过于频繁");
}

// Or blocking (waits with exponential backoff: 1ms, 2ms, 4ms... max 10ms)
limiter.acquire();
```

**No annotation for rate limiting** — use `RateLimiter` programmatically. Requires `RedisTemplate`.

---

## @ReqMonitor / @RpcMonitor — Performance Monitoring

```java
import io.github.lujiafa.houtu.cache.annotation.ReqMonitor;
import io.github.lujiafa.houtu.cache.annotation.RpcMonitor;

@ReqMonitor(cmd = "/api/order/create")
public void createOrder() { ... }

@RpcMonitor(rmtsrv = "payment-service", cmd = "/pay")
public PayResult callPayment() { ... }
```

---

## Common Mistakes

- **@Lock requires Redisson on classpath** — without it, the aspect bean won't register, annotation silently ignored
- **@Lock key resolves by parameter name matching**, not SpEL expression — `key = "orderId"` matches parameter named `orderId`
- **Lock key = `redis:distributed:lock:` + prefix + key** — be aware of the auto prefix when debugging
- **RateLimiter needs RedisTemplate** — inject it, not create manually
- **Do NOT confuse houtu-cache with Spring Cache** — houtu-cache provides lock/rate-limit/monitoring, not @Cacheable replacement
