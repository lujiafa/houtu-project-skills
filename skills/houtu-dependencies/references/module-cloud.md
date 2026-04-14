# Spring Cloud Houtu Modules — Complete Guide

> **Prerequisites**: Before using Spring Cloud modules, `<dependencyManagement>` must include both the `houtu-dependencies` and `spring-cloud-houtu` BOMs (with matching version numbers). See `quick-start.md` for details.

## spring-cloud-houtu-loadbalancer — Intelligent Routing

### Maven

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>spring-cloud-houtu-loadbalancer</artifactId>
</dependency>
```

### Configuration

Config prefix: `spring.cloud.loadbalancer`

| Property | Type | Default | Description |
|------|------|--------|------|
| `weight` | boolean | true | Enable weight routing |
| `hint` | boolean | true | Enable hint / canary routing |
| `disable-gateway-request-hint` | boolean | false | Remove X-Hint request header in Gateway scenarios to prevent interference with the call chain |

```yaml
spring:
  cloud:
    loadbalancer:
      weight: true
      hint: true
      disable-gateway-request-hint: false
```

### Gray Routing (Hint-Based)

Route requests to specific service instances by hint label:

```java
import io.github.lujiafa.houtu.springcloud.loadbalancer.support.hint.HintContext;

// Code-level hint (current thread only, not propagated)
HintContext.set("gray-v2");
userService.getById(id);    // Routed to instances with hint "gray-v2"
HintContext.remove();        // MUST clean up

// Chain-level hint (propagates to ALL downstream services via x-hint header)
HintContext.setX("canary-blue");
orderService.create(order);  // This + all downstream calls use "canary-blue"
HintContext.remove();
```

**Hint priority:** Request header > `HintContext.set()` > config > `x-hint` header

**HintContext methods (all static):**
```java
static InnerHintData get()      // Get/create current thread's hint holder
static void set(String value)   // Thread-local hint (equivalent to get().setHint(value))
static void setX(String value)  // Chain-propagated hint (equivalent to get().setXHint(value))
static void remove()            // Clear ThreadLocal — ALWAYS call in finally block
```

**InnerHintData** is an internal data class; usually no need to operate on it directly — use `HintContext.set()`/`setX()` instead.

### Weight Routing

Set instance weight in service metadata (e.g., Nacos):
- Range: 1-100 (default: 100)
- Higher weight → more traffic
- Failed instances auto-degrade: weight × 0.8 per failure
- Recovery: weight × 1.1 per success, until original weight restored

---

## spring-cloud-houtu-feign — Feign Enhancement

### Maven

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>spring-cloud-houtu-feign</artifactId>
</dependency>
```

### @AutoFeign — Auto-Publish Interface as HTTP Endpoint

On the **provider** (server) side, Feign interfaces auto-register as HTTP endpoints without writing a Controller:

```java
import io.github.lujiafa.houtu.springcloud.feign.anotation.AutoFeign;

// Define the Feign interface (shared between consumer & provider)
@AutoFeign
@FeignClient("user-service")
public interface UserApi {
    @GetMapping("/user/{id}")
    ResponseData<User> getById(@PathVariable Long id);

    @PostMapping("/user")
    ResponseData<User> create(@RequestBody UserForm form);
}
```

**Provider side:** Just declare the interface with `@AutoFeign` — framework auto-publishes it to HandlerMapping. No Controller needed.

**Consumer side:** Standard Feign usage — `@FeignClient` + `@EnableFeignClients`.

**Priority:** SpringMVC Controller > @AutoFeign. If a Controller already maps the same path, @AutoFeign is skipped.

**Attributes:**
- `boolean value()` default `true` — enable/disable
- `boolean responseBody()` default `true` — enable @ResponseBody behavior

### Exception Propagation

Upstream `BusinessException` automatically propagates to downstream via `FeignDelegateDecoder`:
- Provider throws `BusinessException` -> Framework serializes ErrorCode to response header `ExceptionHeader.RESPONSE_EXCEPTION_HEADER_NAME`
- Consumer's `FeignDelegateDecoder` detects the response header -> Throws `FeignThroughBusinessException` (extends BusinessException)
- Consumer-side `UnifiedHandlerExceptionResolver` handles it automatically, returning the same `{code, message}`

> **Note**: If the Feign interface return type is `ResponseData` or `Map`, exception propagation is not triggered (JSON is returned directly).

---

## spring-cloud-houtu-discovery — Service Discovery

### Maven

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>spring-cloud-houtu-discovery</artifactId>
</dependency>
```

### ServiceContext — Check Service Online Status

```java
import io.github.lujiafa.houtu.springcloud.discovery.context.ServiceContext;
import io.github.lujiafa.houtu.springcloud.discovery.type.ServiceStatus;

// Inject the ServiceContext (it's an interface with registry-specific implementations)
@Autowired
private ServiceContext serviceContext;

// Check before processing MQ messages or scheduled tasks
@RabbitListener(queues = "orders")
public void onMessage(OrderMessage msg) {
    if (serviceContext.getServiceState() == ServiceStatus.UP) {
        orderService.process(msg);
    }
    // If DOWN: skip processing, service is deregistering
}
```

**ServiceContext interface:**
```java
ServiceStatus getServiceState()   // Returns UP or DOWN
```

**ServiceStatus enum:** `UP`, `DOWN`

**Supported registries:** Nacos, Eureka, Consul, Zookeeper (auto-detected from classpath).

---

## spring-cloud-houtu-sentinel — Circuit Breaking & Rate Limiting

### Maven

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>spring-cloud-houtu-alibaba-sentinel</artifactId>
</dependency>
```

### Configuration — Nacos Rule Persistence

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080       # Sentinel Dashboard
      datasource:
        flow:
          nacos:
            server-addr: localhost:8848
            data-id: ${spring.application.name}-flow-rules
            group-id: SENTINEL_GROUP
            rule-type: flow
        degrade:
          nacos:
            server-addr: localhost:8848
            data-id: ${spring.application.name}-degrade-rules
            group-id: SENTINEL_GROUP
            rule-type: degrade
```

### Nacos Flow Rule Example

DataId: `my-service-flow-rules`, Group: `SENTINEL_GROUP`:

```json
[{
    "resource": "/api/order/create",
    "limitApp": "default",
    "grade": 1,
    "count": 100,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
}]
```

Framework auto-registers `WritableDataSource` for Nacos, enabling rule push from Dashboard back to Nacos.

**Custom block handler** auto-registered: returns `{code, message}` JSON response when blocked.

---

## Common Mistakes

- **HintContext.remove() is mandatory** — forgetting causes hint to leak to subsequent requests on the same thread
- **ServiceContext is an interface** — inject it, don't call static methods (there's no `ServiceContext.isOnline()`)
- **@AutoFeign on provider side only** — consumer uses standard `@FeignClient`
- **Sentinel rules in Nacos must match rule-type** — `flow` rules in `flow` data-id, not mixed
- **spring-cloud-houtu-feign requires spring-cloud-houtu-loadbalancer** transitively — it's included
